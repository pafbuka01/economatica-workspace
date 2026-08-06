#!/usr/bin/env node
/**
 * Constrói o snapshot do comparador a partir dos dumps brutos da Economatica.
 *
 *   scripts/raw/*.json  ->  src/data/comparator/snapshot.json
 *
 * Os dumps em scripts/raw/ são respostas cruas de `equities_screen`, particionadas
 * por setor Bovespa (a paginação por cursor da API repete a primeira página, então
 * o particionamento por setor é o que garante cobertura determinística do universo).
 *
 * O que este script faz, e que a API não entrega pronto:
 *  - une as partições e deduplica por ticker, preferindo o registro mais completo;
 *  - agrupa classes da mesma empresa por CNPJ e elege a classe primária (mais líquida);
 *  - calcula a distribuição setorial (min/P25/mediana/P75/max) por métrica, que é o
 *    que alimenta o badge de percentil da tabela;
 *  - exclui múltiplo de preço negativo da estatística (P/L negativo não é "barato").
 *
 * Uso: node scripts/build-snapshot.mjs
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const RAW_DIR = join(ROOT, 'scripts', 'raw')
const OUT_FILE = join(ROOT, 'src', 'data', 'comparator', 'snapshot.json')

/** Carimbo de frescor — vem do bloco data_freshness das respostas da Economatica. */
const FRESHNESS = {
  fundamentalsQuarter: '2T2026',
  fundamentalsQuarterEnd: '2026-06-30',
  marketDataAsOf: '2026-08-05',
}

/** Campos de identidade (string) preservados por ticker. */
const ID_FIELDS = [
  'ticker',
  'name',
  'cnpj',
  'share_class',
  'sector_bovespa',
  'subsector_bovespa',
  'segment_bovespa',
  'listing_segment',
]

/** Métricas numéricas do snapshot. */
const METRIC_FIELDS = [
  'close_price_brl',
  'market_cap_brl_thousands',
  'enterprise_value_brl_thousands',
  'total_assets_brl_thousands',
  'equity_brl_thousands',
  'revenue_3m_brl_thousands',
  'pe_ltm',
  'pb_ltm',
  'ev_ebitda_ltm',
  'ev_ebit_ltm',
  'ev_sales_ltm',
  'psr_ltm',
  'pfcf_ltm',
  'roe_ltm_pct',
  'roa_ltm_pct',
  'roic_ltm_pct',
  'ebitda_margin_ltm_pct',
  'net_margin_ltm_pct',
  'fcf_margin_ltm_pct',
  'net_debt_ebitda_ltm',
  'dividend_yield_ltm_pct',
  'return_1m_pct',
  'return_3m_pct',
  'return_6m_pct',
  'return_1y_pct',
  'return_ytd_pct',
  'beta_5y',
  'volatility_1y_pct',
  'avg_quarterly_volume_brl_thousands',
]

/**
 * Múltiplos de preço: valor negativo é "não significativo" (n/m), não é barato.
 * Ficam fora da estatística setorial para não puxar a mediana artificialmente.
 */
const PRICE_MULTIPLES = new Set([
  'pe_ltm',
  'pb_ltm',
  'ev_ebitda_ltm',
  'ev_ebit_ltm',
  'ev_sales_ltm',
  'psr_ltm',
  'pfcf_ltm',
])

/** Métricas que não se aplicam a bancos e seguradoras (EV vem nulo na fonte). */
const EV_BASED = new Set(['ev_ebitda_ltm', 'ev_ebit_ltm', 'ev_sales_ltm', 'net_debt_ebitda_ltm'])

function loadRawHits() {
  const files = readdirSync(RAW_DIR).filter((f) => f.endsWith('.json'))
  if (!files.length) throw new Error(`nenhum dump em ${RAW_DIR}`)

  /** @type {Map<string, Record<string, unknown>>} */
  const byTicker = new Map()
  let seen = 0

  for (const file of files) {
    const doc = JSON.parse(readFileSync(join(RAW_DIR, file), 'utf8'))
    for (const hit of doc.hits ?? []) {
      if (!hit.ticker) continue
      seen++
      const prev = byTicker.get(hit.ticker)
      // Partições se sobrepõem (varreduras de gap). Fica o registro mais completo.
      if (!prev || countFilled(hit) > countFilled(prev)) byTicker.set(hit.ticker, hit)
    }
  }

  console.log(`  ${files.length} dumps, ${seen} linhas -> ${byTicker.size} tickers únicos`)
  return [...byTicker.values()]
}

const countFilled = (row) => Object.values(row).filter((v) => v !== null && v !== undefined).length

/** Quantil linear-interpolado sobre um array já ordenado. */
function quantile(sorted, q) {
  if (!sorted.length) return null
  const pos = (sorted.length - 1) * q
  const lo = Math.floor(pos)
  const hi = Math.ceil(pos)
  if (lo === hi) return sorted[lo]
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo)
}

const round = (v, d = 2) => (v === null ? null : Math.round(v * 10 ** d) / 10 ** d)

/**
 * Distribuição por setor e por métrica. Só entram empresas (classe primária) —
 * contar PETR3 e PETR4 separadamente duplicaria a Petrobras na mediana do setor.
 */
function buildSectorStats(companies) {
  /** @type {Record<string, Record<string, object>>} */
  const stats = {}
  const bySector = new Map()

  for (const c of companies) {
    if (!c.isPrimaryClass) continue
    const key = c.sector || 'Outros'
    if (!bySector.has(key)) bySector.set(key, [])
    bySector.get(key).push(c)
  }

  for (const [sector, members] of bySector) {
    stats[sector] = {}
    for (const metric of METRIC_FIELDS) {
      const values = members
        .map((m) => m.metrics[metric])
        .filter((v) => typeof v === 'number' && Number.isFinite(v))
        // P/L de -4 não é "mais barato" que P/L de 5 — fora da estatística.
        .filter((v) => !(PRICE_MULTIPLES.has(metric) && v <= 0))
        .sort((a, b) => a - b)

      // Menos de 3 observações não sustenta um percentil honesto.
      if (values.length < 3) continue

      stats[sector][metric] = {
        n: values.length,
        min: round(values[0]),
        p25: round(quantile(values, 0.25)),
        median: round(quantile(values, 0.5)),
        p75: round(quantile(values, 0.75)),
        max: round(values[values.length - 1]),
      }
    }
  }

  return stats
}

function build() {
  console.log('Lendo dumps brutos...')
  const rows = loadRawHits()

  // Classes da mesma empresa compartilham CNPJ. A primária é a mais líquida —
  // é ela que representa a empresa em ranking e estatística de setor.
  const byCnpj = new Map()
  for (const row of rows) {
    const cnpj = row.cnpj || row.ticker
    if (!byCnpj.has(cnpj)) byCnpj.set(cnpj, [])
    byCnpj.get(cnpj).push(row)
  }

  const primaryTickers = new Set()
  for (const group of byCnpj.values()) {
    const primary = group.reduce((best, row) =>
      (row.avg_quarterly_volume_brl_thousands ?? -1) > (best.avg_quarterly_volume_brl_thousands ?? -1)
        ? row
        : best,
    )
    primaryTickers.add(primary.ticker)
  }

  const companies = rows
    .map((row) => {
      const cnpj = row.cnpj || row.ticker
      const isBank = row.segment_bovespa === 'Bancos' || row.segment_bovespa === 'Seguradoras'

      const metrics = {}
      for (const field of METRIC_FIELDS) {
        const value = row[field]
        metrics[field] = typeof value === 'number' && Number.isFinite(value) ? value : null
      }

      return {
        ticker: row.ticker,
        name: row.name ?? row.ticker,
        cnpj,
        shareClass: row.share_class ?? null,
        sector: row.sector_bovespa ?? 'Outros',
        subsector: row.subsector_bovespa ?? null,
        segment: row.segment_bovespa ?? null,
        listing: row.listing_segment ?? null,
        isPrimaryClass: primaryTickers.has(row.ticker),
        // Demais classes da mesma empresa — a UI avisa em vez de comparar duplicata.
        classPeers: (byCnpj.get(cnpj) ?? [])
          .map((r) => r.ticker)
          .filter((t) => t !== row.ticker)
          .sort(),
        // EV vem nulo para bancos na fonte: múltiplo de EV ali é "não aplicável",
        // que é diferente de "sem dado".
        evNotApplicable: isBank,
        metrics,
      }
    })
    .sort((a, b) => (b.metrics.market_cap_brl_thousands ?? 0) - (a.metrics.market_cap_brl_thousands ?? 0))

  console.log('Calculando distribuição setorial...')
  const sectorStats = buildSectorStats(companies)

  const snapshot = {
    meta: {
      source: 'Economatica',
      ...FRESHNESS,
      tickerCount: companies.length,
      companyCount: byCnpj.size,
      sectorCount: Object.keys(sectorStats).length,
      evNotApplicableCount: companies.filter((c) => c.evNotApplicable).length,
    },
    sectorStats,
    companies,
  }

  mkdirSync(dirname(OUT_FILE), { recursive: true })
  writeFileSync(OUT_FILE, JSON.stringify(snapshot))

  const kb = (Buffer.byteLength(JSON.stringify(snapshot)) / 1024).toFixed(0)
  console.log(`\nOK -> src/data/comparator/snapshot.json (${kb} KB)`)
  console.log(`  ${snapshot.meta.tickerCount} tickers / ${snapshot.meta.companyCount} empresas`)
  console.log(`  ${snapshot.meta.sectorCount} setores com estatística`)
  console.log(`  fundamentos ${FRESHNESS.fundamentalsQuarter} · preço ${FRESHNESS.marketDataAsOf}`)
}

build()
