#!/usr/bin/env node
// Passo 2 da atualização incremental: funde os arquivos de data/_upd/ no
// data.json, estendendo o calendário e refazendo por inteiro as séries que a
// fonte reajustou.
//
// Cada arquivo em _upd/ tem {"t":TICKER,"rows":[{"date":"YYYY-MM-DD","close_adj":num},...]}
// já filtrado (sem feriado, sem valor nulo).
//
// Regra crítica: close_adj é total-return e a Economatica o recalcula PARA TRÁS
// a cada provento, JCP ou split. Anexar cegamente misturaria duas escalas de
// preço na mesma série e envenenaria o ratio e o z-score de longo prazo. Por
// isso a janela de sobreposição é comparada com o que está gravado; divergiu,
// a série inteira daquele papel é reconstruída (--full marca quem refazer).
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const UPD = join(ROOT, 'data', '_upd');
const ANCHOR = 'PETR4';
const px = v => +v.toFixed(4);

const db = JSON.parse(readFileSync(join(ROOT, 'data.json'), 'utf8'));
if (!existsSync(UPD)) throw new Error('nada em data/_upd — rode a coleta antes');

const rowsBy = {};
for (const f of readdirSync(UPD).filter(f => f.endsWith('.json'))) {
  const j = JSON.parse(readFileSync(join(UPD, f), 'utf8'));
  if (!j?.t || !Array.isArray(j.rows)) continue;
  rowsBy[j.t] = j.rows
    .filter(r => r && typeof r.date === 'string' && typeof r.close_adj === 'number' && isFinite(r.close_adj) && r.close_adj > 0)
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}
if (!rowsBy[ANCHOR]) throw new Error(`âncora ${ANCHOR} ausente — ela define os pregões novos`);

const rep = { novosPregoes: [], reajustados: [], semResposta: [], ignorados: [] };
let dateIdx = new Map(db.dates.map((d, i) => [d, i]));

// 1. calendário: só o que a âncora viu negociar depois do último pregão gravado
const novos = rowsBy[ANCHOR].map(r => r.date).filter(d => d > db.asof).sort();
rep.novosPregoes = novos;

// 2. quem foi reajustado (compara a sobreposição com o gravado)
function reajustou(rec, rows) {
  let vistos = 0, fora = 0;
  for (const r of rows) {
    const gi = dateIdx.get(r.date); if (gi === undefined) continue;
    const k = gi - rec.o; if (k < 0 || k >= rec.c.length) continue;
    const antigo = rec.c[k]; if (antigo == null) continue;
    vistos++; if (Math.abs(antigo - r.close_adj) / r.close_adj > 0.002) fora++;
  }
  return vistos >= 5 && fora / vistos > 0.3;
}
const tickers = Object.keys(db.series);
for (const t of tickers) {
  if (!rowsBy[t]) { rep.semResposta.push(t); continue; }
  if (reajustou(db.series[t], rowsBy[t])) rep.reajustados.push(t);
}

// 3. estende o calendário e anexa os pregões novos
if (novos.length) {
  db.dates = db.dates.concat(novos);
  db.asof = db.dates[db.dates.length - 1];
  dateIdx = new Map(db.dates.map((d, i) => [d, i]));
  for (const t of tickers) {
    const rows = rowsBy[t]; if (!rows) continue;
    const porData = new Map(rows.map(r => [r.date, px(r.close_adj)]));
    const c = db.series[t].c;
    for (const d of novos) {
      const v = porData.get(d);
      c.push(v != null ? v : c[c.length - 1]);   // sem negócio no dia: carrega a última cotação
    }
  }
}

// 4. reconstrói as séries reajustadas — exige a série cheia em _upd/<T>.json
for (const t of rep.reajustados) {
  const rows = rowsBy[t];
  const hits = [];
  for (const r of rows) { const gi = dateIdx.get(r.date); if (gi !== undefined) hits.push([gi, px(r.close_adj)]); }
  if (hits.length < 200) { rep.ignorados.push({ t, motivo: `só ${hits.length} pregões: recolete a série cheia (3 anos) para refazer` }); continue; }
  const o = hits[0][0], fim = hits[hits.length - 1][0];
  const c = Array(fim - o + 1).fill(null);
  for (const [gi, v] of hits) c[gi - o] = v;
  for (let j = 1; j < c.length; j++) if (c[j] === null) c[j] = c[j - 1];
  db.series[t] = { o, c };
}

// 5. sanidade: toda série tem de terminar no último pregão do calendário
const fim = db.dates.length - 1;
for (const t of tickers) {
  const s = db.series[t];
  const termina = s.o + s.c.length - 1;
  if (termina !== fim) rep.ignorados.push({ t, motivo: `termina em ${db.dates[termina]}, calendário vai até ${db.dates[fim]}` });
}

writeFileSync(join(ROOT, 'data.json'), JSON.stringify(db));
console.log(JSON.stringify({
  asof: db.asof, pregoes: db.dates.length,
  novosPregoes: rep.novosPregoes,
  reajustados: rep.reajustados,
  semResposta: rep.semResposta,
  inconsistencias: rep.ignorados,
  tamanhoKB: +(JSON.stringify(db).length / 1024).toFixed(0),
}, null, 1));
