import snapshotJson from './snapshot.json'
import type { Company, ComparatorSource, MetricDistribution, MetricKey, Snapshot } from './types'

const snapshot = snapshotJson as unknown as Snapshot

/** Remove acento e caixa para busca tolerante ("acucar" acha "Açúcar"). */
const fold = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

const searchIndex = snapshot.companies.map((c) => ({
  company: c,
  ticker: c.ticker.toLowerCase(),
  name: fold(c.name),
}))

const byTicker = new Map(snapshot.companies.map((c) => [c.ticker.toUpperCase(), c]))

/** Liquidez é o desempate padrão em toda listagem. */
const byLiquidity = (a: Company, b: Company) =>
  (b.metrics.avg_quarterly_volume_brl_thousands ?? -1) - (a.metrics.avg_quarterly_volume_brl_thousands ?? -1)

/**
 * Fonte apoiada no snapshot versionado (`snapshot.json`, gerado por
 * `scripts/build-snapshot.mjs` a partir dos dumps da Economatica).
 *
 * Uma implementação ao vivo troca só este objeto: a UI depende da interface
 * `ComparatorSource`, não do snapshot.
 */
export const snapshotSource: ComparatorSource = {
  meta: snapshot.meta,

  all: () => snapshot.companies,

  get: (ticker) => byTicker.get(ticker.toUpperCase()),

  search(query, limit = 12) {
    const q = fold(query)
    if (!q) return []

    const scored: Array<{ company: Company; score: number }> = []
    for (const entry of searchIndex) {
      let score = -1
      if (entry.ticker === q) score = 0
      else if (entry.ticker.startsWith(q)) score = 1
      else if (entry.name.startsWith(q)) score = 2
      else if (entry.name.includes(q)) score = 3
      else if (entry.ticker.includes(q)) score = 4
      if (score >= 0) scored.push({ company: entry.company, score })
    }

    return scored
      .sort((a, b) => a.score - b.score || byLiquidity(a.company, b.company))
      .slice(0, limit)
      .map((s) => s.company)
  },

  /**
   * Cascata segmento -> subsetor -> setor, como o peer set da Economatica.
   * Só classe primária: trazer PETR3 como "par" da PETR4 compararia a empresa
   * com ela mesma.
   */
  peersOf(ticker, limit = 5) {
    const target = byTicker.get(ticker.toUpperCase())
    if (!target) return []

    const candidates = snapshot.companies.filter(
      (c) => c.isPrimaryClass && c.cnpj !== target.cnpj,
    )

    const tiers = [
      candidates.filter((c) => target.segment && c.segment === target.segment),
      candidates.filter((c) => target.subsector && c.subsector === target.subsector),
      candidates.filter((c) => c.sector === target.sector),
    ]

    const picked: Company[] = []
    const seen = new Set<string>()
    for (const tier of tiers) {
      for (const c of [...tier].sort(byLiquidity)) {
        if (picked.length >= limit) break
        if (seen.has(c.ticker)) continue
        seen.add(c.ticker)
        picked.push(c)
      }
      if (picked.length >= limit) break
    }

    return picked
  },

  distribution(sector, metric): MetricDistribution | null {
    return snapshot.sectorStats[sector]?.[metric] ?? null
  },
}

/** Setores presentes no universo, com a contagem de empresas de cada um. */
export function sectorSummary(): Array<{ sector: string; companies: number }> {
  const counts = new Map<string, number>()
  for (const c of snapshot.companies) {
    if (!c.isPrimaryClass) continue
    counts.set(c.sector, (counts.get(c.sector) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([sector, companies]) => ({ sector, companies }))
    .sort((a, b) => b.companies - a.companies)
}

/** Empresas mais líquidas do universo — usadas como sugestão inicial. */
export function mostLiquid(limit = 8): Company[] {
  return snapshot.companies.filter((c) => c.isPrimaryClass).sort(byLiquidity).slice(0, limit)
}

export type { MetricKey }
