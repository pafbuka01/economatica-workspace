#!/usr/bin/env node
/**
 * Monta o artefato "Comparador de fundos" a partir dos dados brutos da Economatica.
 *
 *   node tools/comparador/build.mjs [dirDadosBrutos]
 *
 * Entrada  : funds.json (catálogo) + <fund_id>_a|b.json (cotas) + ibov_*.json + cdi.json
 * Saída    : tools/comparador/data/economatica-fundos.json  (dataset consolidado)
 *            artifacts/comparador-fundos.html               (página autocontida)
 *
 * A curva do CDI não vem pronta: a Economatica publica a taxa anual por dia útil,
 * então ela é acumulada aqui por (1 + i)^(1/252), convenção do mercado brasileiro.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const RAW = process.argv[2] || path.join(HERE, 'data', 'raw');

const read = (f) => JSON.parse(fs.readFileSync(path.join(RAW, f), 'utf8'));
const exists = (f) => fs.existsSync(path.join(RAW, f));

/* ------------------------------------------------------------------ *
 * Catálogo
 * ------------------------------------------------------------------ */

const catalog = read('funds.json').funds;
const CATEGORIES = ['Multimercado', 'Ações', 'Renda Fixa'];

/* ------------------------------------------------------------------ *
 * Séries brutas
 * ------------------------------------------------------------------ */

/**
 * Concatena fatias, remove duplicatas de data e ordena. Aceita tanto o formato
 * compacto ([data, valor]) quanto o objeto cru da API ({date, close|cota}).
 */
function joinSlices(files) {
  const byDate = new Map();
  for (const f of files) {
    if (!exists(f)) throw new Error(`arquivo ausente: ${f}`);
    for (const point of read(f).series) {
      const [date, value] = Array.isArray(point)
        ? point
        : [point.date, point.close ?? point.cota];
      if (typeof date !== 'string' || typeof value !== 'number' || !isFinite(value)) {
        throw new Error(`ponto inválido em ${f}: ${JSON.stringify(point)}`);
      }
      byDate.set(date, value);
    }
  }
  return [...byDate.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1));
}

const funds = new Map();
for (const f of catalog) {
  const series = joinSlices([`${f.fund_id}_a.json`, `${f.fund_id}_b.json`]);
  if (series.length < 1000) {
    throw new Error(`${f.fund_id} (${f.short_name}) só tem ${series.length} pontos — série incompleta`);
  }
  funds.set(f.fund_id, series);
}

const ibov = joinSlices(['ibov_1.json', 'ibov_2.json', 'ibov_3.json', 'ibov_4.json', 'ibov_5.json']);

/* ------------------------------------------------------------------ *
 * Calendários
 * ------------------------------------------------------------------ */

/** Dias úteis dos fundos (é o calendário do CDI também). */
const fundDates = [...new Set([...funds.values()].flatMap((s) => s.map(([d]) => d)))].sort();
const masterDates = [...new Set([...fundDates, ...ibov.map(([d]) => d)])].sort();
const idxOf = new Map(masterDates.map((d, i) => [d, i]));

/* ------------------------------------------------------------------ *
 * CDI — acumula a taxa anual publicada em cada dia útil
 * ------------------------------------------------------------------ */

const cdiRaw = read('cdi.json');
const changes = cdiRaw.rate_changes;

/** Taxa vigente em cada data do calendário dos fundos (forward-fill). */
function rateOn(dates) {
  const out = [];
  let ci = 0;
  let current = changes[0][1];
  for (const d of dates) {
    while (ci < changes.length && changes[ci][0] <= d) {
      current = changes[ci][1];
      ci++;
    }
    out.push(current);
  }
  return out;
}

const cdiDates = fundDates.filter((d) => d >= changes[0][0]);
const rates = rateOn(cdiDates);

/**
 * Duas convenções possíveis para o fator do dia i: a taxa do próprio dia, ou a
 * do dia anterior. Geramos as duas e a verificação escolhe a que bate com o
 * risk_stats da Economatica.
 */
function accumulate(offset) {
  const out = [1];
  for (let i = 1; i < cdiDates.length; i++) {
    const r = rates[Math.max(0, i - offset)];
    out.push(out[i - 1] * Math.pow(1 + r / 100, 1 / 252));
  }
  return out;
}

const cdiVariants = { same: accumulate(0), prev: accumulate(1) };

/* ------------------------------------------------------------------ *
 * Empacotamento
 * ------------------------------------------------------------------ */

const round = (v) => Number(v.toPrecision(10));

/** Alinha uma série ao calendário-mestre: índice inicial + valores (null nos buracos). */
function pack(series) {
  const start = idxOf.get(series[0][0]);
  const end = idxOf.get(series[series.length - 1][0]);
  const v = new Array(end - start + 1).fill(null);
  for (const [date, value] of series) v[idxOf.get(date) - start] = round(value);
  return { s: start, v };
}

function buildAssets(cdiVariant) {
  const assets = {};
  for (const f of catalog) {
    assets[f.fund_id] = {
      name: f.short_name,
      full: f.name,
      cat: f.category,
      manager: (f.manager || '').replace(/\s+(Ltda|S\.?A\.?|Sa)\.?$/i, '').trim(),
      fee: f.admin_fee_pct ?? null,
      ...pack(funds.get(f.fund_id))
    };
  }
  assets.IBOV = { name: 'Ibovespa', full: 'Índice Bovespa', cat: null, ...pack(ibov) };
  assets.CDI = {
    name: 'CDI',
    full: 'CDI acumulado',
    cat: null,
    ...pack(cdiDates.map((d, i) => [d, cdiVariant[i]]))
  };
  return assets;
}

/* ------------------------------------------------------------------ *
 * Métricas (mesmas fórmulas do artefato) — usadas na verificação
 * ------------------------------------------------------------------ */

export function metricsFor(values) {
  const n = values.length;
  const cum = values[n - 1] / values[0] - 1;
  const rets = [];
  for (let i = 1; i < n; i++) rets.push(values[i] / values[i - 1] - 1);
  const k = rets.length;
  const cagr = Math.pow(1 + cum, 252 / k) - 1;
  const mean = rets.reduce((a, b) => a + b, 0) / k;
  const sd = Math.sqrt(rets.reduce((a, r) => a + (r - mean) ** 2, 0) / (k - 1));
  const vol = sd * Math.sqrt(252);
  let peak = values[0];
  let maxdd = 0;
  for (const v of values) {
    if (v > peak) peak = v;
    maxdd = Math.min(maxdd, v / peak - 1);
  }
  return { cum: cum * 100, cagr: cagr * 100, vol: vol * 100, maxdd: maxdd * 100, days: n };
}

/** Recorta uma série empacotada pelo intervalo fechado [from, to] em datas ISO. */
export function windowValues(asset, from, to) {
  const v = [];
  for (let i = 0; i < asset.v.length; i++) {
    const d = masterDates[asset.s + i];
    if (asset.v[i] !== null && d >= from && d <= to) v.push(asset.v[i]);
  }
  return v;
}

/* ------------------------------------------------------------------ *
 * Escolhe a convenção do CDI comparando com o risk_stats da Economatica
 * ------------------------------------------------------------------ */

const CHECKS = JSON.parse(fs.readFileSync(path.join(HERE, 'checks.json'), 'utf8'));

function cdiError(variant) {
  const assets = buildAssets(variant);
  let worst = 0;
  for (const chk of CHECKS.windows) {
    const vals = windowValues(assets.CDI, chk.from, chk.to);
    if (vals.length < 2) continue;
    const expected = chk.expect.CDI;
    if (!expected) continue;
    worst = Math.max(worst, Math.abs(metricsFor(vals).cum - expected.cum_return_pct));
  }
  return worst;
}

const errSame = cdiError(cdiVariants.same);
const errPrev = cdiError(cdiVariants.prev);
const useSame = errSame <= errPrev;
const cdiChoice = useSame ? 'taxa do próprio dia' : 'taxa do dia anterior';
const assets = buildAssets(useSame ? cdiVariants.same : cdiVariants.prev);

console.log(
  `CDI: convenção "${cdiChoice}" (erro ${Math.min(errSame, errPrev).toFixed(3)} p.p. vs ` +
    `${Math.max(errSame, errPrev).toFixed(3)} p.p. da alternativa)`
);

/* ------------------------------------------------------------------ *
 * Dataset + HTML
 * ------------------------------------------------------------------ */

const DEFAULTS = ['040177', '541419', '010431', '391573'];

const dataset = {
  source: 'Economatica',
  asof: masterDates[masterDates.length - 1],
  dates: masterDates,
  categories: CATEGORIES,
  defaults: DEFAULTS,
  /* Ordem explícita: fund_id como "262773" é chave inteira para o JS e seria
     reordenada em Object.keys, embaralhando a lista de fundos na tela. */
  order: CATEGORIES.flatMap((cat) =>
    catalog
      .filter((f) => f.category === cat)
      .sort((a, b) => a.short_name.localeCompare(b.short_name, 'pt-BR'))
      .map((f) => f.fund_id)
  ),
  assets
};

if (dataset.order.length !== catalog.length) throw new Error('ordem não cobre todos os fundos');

fs.mkdirSync(path.join(HERE, 'data'), { recursive: true });
const datasetPath = path.join(HERE, 'data', 'economatica-fundos.json');
fs.writeFileSync(datasetPath, JSON.stringify(dataset));

const template = fs.readFileSync(path.join(HERE, 'template.html'), 'utf8');
if (!template.includes('__DATA__')) throw new Error('template sem marcador __DATA__');
const html = template.replace('__DATA__', () => JSON.stringify(dataset));

fs.mkdirSync(path.join(REPO, 'artifacts'), { recursive: true });
const htmlPath = path.join(REPO, 'artifacts', 'comparador-fundos.html');
fs.writeFileSync(htmlPath, html);

const kb = (p) => (fs.statSync(p).size / 1024).toFixed(0);
console.log(`calendário : ${masterDates.length} pregões (${masterDates[0]} → ${dataset.asof})`);
console.log(`ativos     : ${Object.keys(assets).length} (${catalog.length} fundos + IBOV + CDI)`);
console.log(`dataset    : ${datasetPath} (${kb(datasetPath)} KB)`);
console.log(`artefato   : ${htmlPath} (${kb(htmlPath)} KB)`);

export { assets, masterDates, dataset };
