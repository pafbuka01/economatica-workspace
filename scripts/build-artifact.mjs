#!/usr/bin/env node
/**
 * Injeta o snapshot e os KPIs setoriais no template e emite o artefato
 * autocontido — uma página só, sem nenhuma requisição externa (a CSP do
 * artefato bloqueia qualquer host).
 *
 *   scripts/artifact/comparador.template.html  +  snapshot.json
 *     ->  dist-artifact/comparador.html
 *
 * Uso: node scripts/build-artifact.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const TEMPLATE = join(ROOT, 'scripts', 'artifact', 'comparador.template.html')
const SNAPSHOT = join(ROOT, 'src', 'data', 'comparator', 'snapshot.json')
const KPI_SRC = join(ROOT, 'src', 'data', 'comparator', 'sectorKpis.ts')
const NEWS = join(ROOT, 'src', 'data', 'comparator', 'news.json')
const OUT = join(ROOT, 'dist-artifact', 'comparador.html')

/**
 * O catálogo e os valores de KPI vivem em TS (fonte única, usada também pelo
 * app React). Aqui eles são reescritos no formato compacto que o artefato
 * consome — `dir` numérico em vez de string, para caber no mesmo heatmap.
 */
function loadKpis() {
  const src = readFileSync(KPI_SRC, 'utf8')

  const dirOf = (s) => (s === 'higher' ? 1 : s === 'lower' ? -1 : 0)

  // Catálogo: SECTOR_KPIS = { Segmento: [ {code,label,unit,direction,hint} ] }
  const catalog = {}
  const catalogBlock = src.slice(src.indexOf('export const SECTOR_KPIS'), src.indexOf('export const KPI_VALUES'))
  for (const [, segment, body] of catalogBlock.matchAll(/^ {2}(\w+): \[([\s\S]*?)^ {2}\],$/gm)) {
    catalog[segment] = [...body.matchAll(/\{([\s\S]*?)\n {4}\}/g)].map(([, entry]) => {
      const pick = (field) => entry.match(new RegExp(`${field}: '((?:[^'\\\\]|\\\\.)*)'`))?.[1]
      const def = { code: pick('code'), label: pick('label'), dir: dirOf(pick('direction')) }
      const hint = pick('hint')
      if (hint) def.hint = hint.replace(/\\'/g, "'")
      return def
    })
  }

  // Valores, com a citação (documento CVM, página, trecho, confiança).
  const values = []
  const valuesBlock = src.slice(src.indexOf('export const KPI_VALUES'))
  for (const [, entry] of valuesBlock.matchAll(/^ {2}\{([\s\S]*?)^ {2}\},$/gm)) {
    const str = (field) => entry.match(new RegExp(`${field}: '((?:[^'\\\\]|\\\\.)*)'`))?.[1]
    const num = (field) => Number(entry.match(new RegExp(`${field}: ([-\\d.]+)`))?.[1])
    values.push({
      ticker: str('ticker'),
      code: str('code'),
      value: num('value'),
      citation: {
        document: str('document'),
        page: str('page'),
        url: str('url'),
        snippet: str('snippet').replace(/\\'/g, "'"),
        confidence: num('confidence'),
      },
    })
  }

  return { catalog, values }
}

/** O snapshot carrega nulos para toda métrica ausente; podá-los encolhe a página. */
function compactSnapshot(snap) {
  return {
    meta: snap.meta,
    sectorStats: snap.sectorStats,
    companies: snap.companies.map((c) => {
      const metrics = {}
      for (const [k, v] of Object.entries(c.metrics)) if (v !== null) metrics[k] = v
      const out = { ...c, metrics }
      if (!out.classPeers.length) delete out.classPeers
      if (!out.evNotApplicable) delete out.evNotApplicable
      if (!out.subsector) delete out.subsector
      return out
    }),
  }
}

function build() {
  const template = readFileSync(TEMPLATE, 'utf8')
  const snapshot = compactSnapshot(JSON.parse(readFileSync(SNAPSHOT, 'utf8')))
  const kpis = loadKpis()
  const news = JSON.parse(readFileSync(NEWS, 'utf8'))

  const kpiCount = kpis.values.length
  const catalogCount = Object.values(kpis.catalog).reduce((n, defs) => n + defs.length, 0)
  if (!kpiCount || !catalogCount) throw new Error('KPIs não extraídos de sectorKpis.ts — confira o parser')

  // JSON.stringify não escapa `</script>`; sem isso o navegador fecharia o bloco.
  const inject = (value) => JSON.stringify(value).replace(/<\//g, '<\\/')

  const html = template
    .replace('/*__SNAPSHOT__*/', () => inject(snapshot))
    .replace('/*__KPI__*/', () => inject(kpis))
    .replace('/*__NEWS__*/', () => inject(news))

  if (html.includes('__SNAPSHOT__') || html.includes('__KPI__') || html.includes('__NEWS__')) {
    throw new Error('placeholder não substituído')
  }

  mkdirSync(dirname(OUT), { recursive: true })
  writeFileSync(OUT, html)

  const kb = (Buffer.byteLength(html) / 1024).toFixed(0)
  console.log(`OK -> dist-artifact/comparador.html (${kb} KB)`)
  console.log(`  ${snapshot.companies.length} tickers · ${snapshot.meta.companyCount} empresas`)
  console.log(`  ${catalogCount} KPIs no catálogo, ${kpiCount} valores com citação`)
  console.log(`  sentimento ${news.meta.sentimentTickers} tickers · manchetes ${news.meta.newsTickers} · confiança ${news.meta.iceeTickers}`)
}

build()
