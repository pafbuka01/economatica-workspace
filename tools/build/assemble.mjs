#!/usr/bin/env node
// Monta a base embutida da ferramenta Long & Short.
//
// CONTEXTO IMPORTANTE: a API devolve uma linha por dia do calendário no
// intervalo pedido, INCLUSIVE feriados da B3, com close_adj nulo. Os agentes
// de coleta divergiram: uns transcreveram as linhas de feriado (série "crua",
// 784 pontos), outros as pularam (série "de pregão", 749 pontos). As duas
// leituras são fiéis à fonte.
//
// A âncora é o calendário de PREGÃO: as datas de PETR4 onde há preço válido.
// PETR4 negocia todo pregão, então suas datas não-nulas são exatamente os
// pregões da B3 na janela. Cada série é encaixada nesse calendário; feriados
// nunca viram ponto de preço (forward-fill em feriado inventaria pregão e
// contaminaria vol, correlação e z-score).
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const DATA = join(ROOT, 'data');
const valid = v => typeof v === 'number' && isFinite(v) && v > 0;
const px = v => +v.toFixed(4);

const universe = JSON.parse(readFileSync(join(ROOT, 'universe.json'), 'utf8'));
const uniRows = new Map(universe.rows.map(r => [r[0], r]));
const loadJ = n => (existsSync(join(DATA, n + '.json')) ? JSON.parse(readFileSync(join(DATA, n + '.json'), 'utf8')) : null);

// ---- calendário ----
const anchor = loadJ('PETR4');
if (!anchor?.d) throw new Error('PETR4.json precisa do campo d (âncora do calendário)');
if (anchor.d.length !== anchor.c.length) throw new Error('PETR4: d e c com tamanhos diferentes');
const rawCal = anchor.d.slice();                                   // inclui feriados
const holiday = new Set();                                         // datas sem pregão
anchor.d.forEach((d, i) => { if (!valid(anchor.c[i])) holiday.add(d); });
const cal = rawCal.filter(d => !holiday.has(d));                   // só pregões
const calIdx = new Map(cal.map((d, i) => [d, i]));
const rawIdx = new Map(rawCal.map((d, i) => [d, i]));

const rep = { ok: [], shape: {}, gaps: [], reject: [], missing: [], priceMismatch: [] };
const series = {};

for (const f of readdirSync(DATA).filter(f => f.endsWith('.json') && f !== 'meta.json')) {
  const t = f.replace('.json', '');
  let j;
  try { j = JSON.parse(readFileSync(join(DATA, f), 'utf8')); }
  catch (e) { rep.reject.push({ t, err: 'json inválido: ' + e.message }); continue; }
  if (!Array.isArray(j.c) || !j.c.length) { rep.reject.push({ t, err: 'série vazia' }); continue; }

  let dates, vals, shape;
  if (Array.isArray(j.d) && j.d.length === j.c.length) {
    dates = j.d; vals = j.c; shape = 'com-datas';
  } else {
    // sem datas: deduz o encaixe pelo tamanho, entre f e l no calendário
    const a = rawIdx.get(j.f), b = rawIdx.get(j.l);
    if (a === undefined || b === undefined) { rep.reject.push({ t, err: `bordas ${j.f}/${j.l} fora do calendário` }); continue; }
    const win = rawCal.slice(a, b + 1);
    const winTrading = win.filter(d => !holiday.has(d));
    if (j.c.length === winTrading.length) { dates = winTrading; vals = j.c; shape = 'pregão'; }
    else if (j.c.length === win.length) { dates = win; vals = j.c; shape = 'crua'; }
    else { rep.reject.push({ t, err: `tamanho ${j.c.length} não bate: pregão=${winTrading.length} cru=${win.length}` }); continue; }
  }
  rep.shape[shape] = (rep.shape[shape] || 0) + 1;

  // projeta no calendário de pregão, descartando feriados e valores inválidos
  const hits = [];
  for (let k = 0; k < dates.length; k++) {
    const i = calIdx.get(dates[k]);
    if (i === undefined) continue;               // feriado ou fora da janela
    if (!valid(vals[k])) continue;               // sem preço nesse pregão
    hits.push([i, px(vals[k])]);
  }
  if (hits.length < 60) { rep.reject.push({ t, err: `só ${hits.length} pregões válidos` }); continue; }

  const o = hits[0][0], end = hits[hits.length - 1][0];
  const c = Array(end - o + 1).fill(null);
  for (const [i, v] of hits) c[i - o] = v;
  // buracos internos (papel sem negócio num pregão) recebem o último preço —
  // isso é carregar a última cotação conhecida, não criar pregão inexistente
  let carried = 0;
  for (let k = 1; k < c.length; k++) if (c[k] === null) { c[k] = c[k - 1]; carried++; }
  if (carried) rep.gaps.push({ t, carried });

  const u = uniRows.get(t), last = c[c.length - 1];
  if (u && u[3] != null) {
    const diff = Math.abs(last - u[3]) / u[3];
    if (diff > 0.005) rep.priceMismatch.push({ t, last, esperado: u[3], difPct: +(diff * 100).toFixed(2) });
  }
  series[t] = { o, c };
  rep.ok.push(t);
}
for (const [t] of uniRows) if (!series[t]) rep.missing.push(t);

let meta = {};
if (existsSync(join(DATA, 'meta.json'))) { try { meta = JSON.parse(readFileSync(join(DATA, 'meta.json'), 'utf8')); } catch { } }

const out = {
  asof: cal[cal.length - 1],
  dates: cal,
  series,
  universe: universe.rows.filter(r => series[r[0]]),
  meta: meta.rows || {},
};
writeFileSync(join(ROOT, 'data.json'), JSON.stringify(out));
console.log(JSON.stringify({
  calendario: { de: cal[0], ate: cal[cal.length - 1], pregoes: cal.length, feriadosRemovidos: holiday.size },
  ok: rep.ok.length, formatos: rep.shape,
  faltando: rep.missing, rejeitados: rep.reject,
  precoDivergente: rep.priceMismatch, buracosPreenchidos: rep.gaps,
  metaTickers: Object.keys(out.meta).length,
  tamanhoKB: +(JSON.stringify(out).length / 1024).toFixed(0),
}, null, 1));
