#!/usr/bin/env node
/**
 * Consolida sentimento de notícias, manchetes e confiança da administração.
 *
 *   scripts/raw-news/*.json  +  scripts/raw-sentiment/*.json
 *     ->  src/data/comparator/news.json
 *
 * Três decisões que a API não toma por você, e que definem se o bloco informa
 * ou engana:
 *
 * 1. `by_group` devolve só as contagens brutas; net_sentiment e label vêm apenas
 *    no agregado. O net por ticker é derivado aqui pela fórmula documentada,
 *    (pos−neg)/total.
 *
 * 2. Amostra minúscula não sustenta direção. Abaixo de MIN_SAMPLE o net não é
 *    calculado — a UI diz "amostra insuficiente" em vez de cravar um número
 *    que oscila com uma notícia a mais.
 *
 * 3. "Ibovespa sobe/cai" vem marcada com o ticker e passa longe de ser notícia
 *    da empresa. Item cujo título cita a empresa (ticker, raiz do ticker ou
 *    nome) sobe na fila — é o sinal mais forte de que a matéria é sobre ela.
 *
 * 4. Notícia carrega vários tickers. A matéria de dividendos do InfoMoney vem
 *    marcada com 5 papéis e é sobre a Petrobras; o giro diário chega a 18. Item
 *    com muitos tickers é marcado como `roundup` e cede a vez para a notícia
 *    específica da empresa.
 *
 * Uso: node scripts/build-news.mjs
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const NEWS_DIR = join(ROOT, 'scripts', 'raw-news')
const SENT_DIR = join(ROOT, 'scripts', 'raw-sentiment')
const OUT = join(ROOT, 'src', 'data', 'comparator', 'news.json')
const SNAPSHOT = join(ROOT, 'src', 'data', 'comparator', 'snapshot.json')

/** Abaixo disso, a direção do sentimento é ruído, não sinal. */
const MIN_SAMPLE = 8

/** A partir de quantos tickers a matéria deixa de ser sobre a empresa. */
const ROUNDUP_TICKERS = 4

/** Manchetes guardadas por empresa. */
const PER_TICKER = 3

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

function loadSentiment() {
  const out = {}
  let period = null

  for (const file of readdirSync(SENT_DIR).filter((f) => f.startsWith('sent-'))) {
    const doc = JSON.parse(readFileSync(join(SENT_DIR, file), 'utf8'))
    period ??= doc.period

    for (const [ticker, raw] of Object.entries(doc.by_group)) {
      // A API omite a chave quando a contagem é zero.
      const positive = raw.positive ?? 0
      const neutral = raw.neutral ?? 0
      const negative = raw.negative ?? 0
      const total = positive + neutral + negative
      if (!total) continue

      const enough = total >= MIN_SAMPLE
      // Fórmula documentada da fonte: (pos − neg) / total, exibida em -100..+100.
      const net = enough ? Math.round(((positive - negative) / total) * 100) : null

      out[ticker] = {
        positive,
        neutral,
        negative,
        total,
        net,
        label: net === null ? 'insuficiente' : net >= 10 ? 'positivo' : net <= -10 ? 'negativo' : 'neutro',
      }
    }
  }

  return { sentiment: out, period }
}

const fold = (v) => v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

/** Apelidos por ticker: ticker cheio, raiz de 4 letras e nome da empresa. */
function buildAliases() {
  const snap = JSON.parse(readFileSync(SNAPSHOT, 'utf8'))
  const out = new Map()
  for (const c of snap.companies) {
    const names = [c.ticker.toLowerCase(), c.ticker.slice(0, 4).toLowerCase()]
    // Nome curto demais viraria falso positivo dentro de outra palavra.
    const name = fold(c.name)
    if (name.length >= 5) names.push(name)
    out.set(c.ticker, names)
  }
  return out
}

function loadNews() {
  const aliases = buildAliases()
  /** @type {Map<string, Array<object>>} */
  const byTicker = new Map()
  const seen = new Set()

  for (const file of readdirSync(NEWS_DIR).filter((f) => f.endsWith('.json'))) {
    const doc = JSON.parse(readFileSync(join(NEWS_DIR, file), 'utf8'))

    for (const hit of doc.hits ?? []) {
      // Grupos de busca se sobrepõem: a mesma matéria chega por vários lados.
      if (seen.has(hit._id)) continue
      seen.add(hit._id)

      const tickers = hit.tickers ?? []
      const roundup = tickers.length >= ROUNDUP_TICKERS

      const item = {
        title: hit.title,
        source: hit.source,
        url: hit.link ?? null,
        // Direção vem de `sentiment`. `sentiment_score` é CONFIANÇA do modelo
        // (0..1), não intensidade — usar como intensidade inverteria a leitura.
        sentiment: hit.sentiment ?? 'neutral',
        impact: hit.impact_score ?? 0,
        date: (hit.created_at_iso ?? '').slice(0, 10),
        roundup,
        tickerCount: tickers.length,
      }

      const title = fold(hit.title ?? '')
      for (const ticker of tickers) {
        if (!byTicker.has(ticker)) byTicker.set(ticker, [])
        // Citação no título é por ticker, não por matéria: o mesmo giro pode
        // nomear uma empresa e só tabelar as outras.
        const mentions = (aliases.get(ticker) ?? []).some((a) => title.includes(a))
        byTicker.get(ticker).push({ ...item, mentions })
      }
    }
  }

  const out = {}
  for (const [ticker, items] of byTicker) {
    out[ticker] = items
      .sort((a, b) => {
        // Título que cita a empresa vence tudo: é o sinal mais forte de que a
        // matéria é sobre ela, e não um giro de índice que a tabelou.
        if (a.mentions !== b.mentions) return a.mentions ? -1 : 1
        if (a.roundup !== b.roundup) return a.roundup ? 1 : -1
        return b.impact - a.impact || b.date.localeCompare(a.date)
      })
      .slice(0, PER_TICKER)
  }

  return out
}

function loadIcee() {
  const doc = JSON.parse(readFileSync(join(SENT_DIR, 'icee.json'), 'utf8'))
  const out = {}

  for (const hit of doc.hits) {
    const aspects = Object.entries(hit.by_aspect ?? {}).sort((a, b) => b[1] - a[1])
    out[hit.ticker] = {
      // Índice vem em -1..1; exibido em -100..100, como o net de notícias.
      index: Math.round(hit.confidence_index * 100),
      delta: Math.round(hit.delta_qoq * 100),
      period: hit.fiscal_period,
      url: hit.source_url,
      // Aspectos extremos: o que sustenta e o que derruba o tom da call.
      up: aspects.filter(([, v]) => v > 0).slice(0, 3).map(([k]) => k),
      down: aspects.filter(([, v]) => v < 0).slice(-3).reverse().map(([k]) => k),
    }
  }

  return { icee: out, period: doc.period, attribution: doc.attribution, disclaimer: doc.disclaimer }
}

function build() {
  const { sentiment, period } = loadSentiment()
  const news = loadNews()
  const { icee, period: iceePeriod, attribution, disclaimer } = loadIcee()

  const withNet = Object.values(sentiment).filter((s) => s.net !== null).length

  const doc = {
    meta: {
      source: 'Economatica',
      windowFrom: period.from,
      windowTo: period.to,
      windowDays: period.days,
      minSample: MIN_SAMPLE,
      roundupTickers: ROUNDUP_TICKERS,
      sentimentTickers: Object.keys(sentiment).length,
      sentimentWithNet: withNet,
      newsTickers: Object.keys(news).length,
      iceePeriod,
      iceeTickers: Object.keys(icee).length,
      iceeAttribution: attribution,
      iceeDisclaimer: disclaimer,
    },
    sentiment,
    news,
    icee,
  }

  mkdirSync(dirname(OUT), { recursive: true })
  writeFileSync(OUT, JSON.stringify(doc))

  const kb = (Buffer.byteLength(JSON.stringify(doc)) / 1024).toFixed(0)
  console.log(`OK -> src/data/comparator/news.json (${kb} KB)`)
  console.log(`  sentimento: ${doc.meta.sentimentTickers} tickers (${withNet} com amostra >= ${MIN_SAMPLE})`)
  console.log(`  manchetes:  ${doc.meta.newsTickers} tickers`)
  console.log(`  confiança:  ${doc.meta.iceeTickers} empresas com call no ${iceePeriod}`)
  console.log(`  janela:     ${period.from} a ${period.to} (${period.days}d)`)
}

build()
