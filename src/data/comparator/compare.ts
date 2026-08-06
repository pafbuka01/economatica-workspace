import { snapshotSource } from './source'
import type { Company, MetricCell, MetricDef, MetricDistribution, MetricKey } from './types'

/**
 * Decide o que a célula mostra. Três "vazios" diferentes que não podem virar
 * a mesma coisa na tela:
 *  - `na`      métrica não se aplica ao setor (EV/EBITDA em banco);
 *  - `nm`      múltiplo de preço negativo, não significativo;
 *  - `missing` a fonte não publicou o dado.
 */
export function cellFor(company: Company, metric: MetricDef): Pick<MetricCell, 'status' | 'value'> {
  if (metric.requiresEv && company.evNotApplicable) return { status: 'na', value: null }

  const value = company.metrics[metric.key]
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return { status: 'missing', value: null }
  }
  if (metric.priceMultiple && value <= 0) return { status: 'nm', value }

  return { status: 'ok', value }
}

/**
 * Percentil da empresa dentro do setor, interpolado entre os cinco pontos da
 * distribuição. Já vem orientado pela direção: 100 é sempre "melhor do setor",
 * então em P/L o percentil alto significa mais barato, não mais caro.
 */
export function sectorPercentile(
  value: number,
  dist: MetricDistribution,
  direction: MetricDef['direction'],
): number | null {
  if (direction === 'neutral') return null

  const points: Array<[number, number]> = [
    [dist.min, 0],
    [dist.p25, 25],
    [dist.median, 50],
    [dist.p75, 75],
    [dist.max, 100],
  ]

  let ascending = 0
  if (value <= points[0][0]) ascending = 0
  else if (value >= points[4][0]) ascending = 100
  else {
    ascending = 100
    for (let i = 0; i < points.length - 1; i++) {
      const [lowValue, lowPct] = points[i]
      const [highValue, highPct] = points[i + 1]
      if (value >= lowValue && value <= highValue) {
        const span = highValue - lowValue
        ascending = span === 0 ? lowPct : lowPct + ((value - lowValue) / span) * (highPct - lowPct)
        break
      }
    }
  }

  // "Menor é melhor" inverte: estar no fundo da distribuição é estar no topo.
  return Math.round(direction === 'lower' ? 100 - ascending : ascending)
}

/**
 * Monta a linha da tabela para uma métrica sobre a seleção atual.
 *
 * O `rank` (0 = pior, 1 = melhor) é o que pinta o heatmap, e só considera as
 * células `ok` — n/a, n/m e ausente não competem no gradiente.
 */
export function buildRow(companies: Company[], metric: MetricDef): MetricCell[] {
  const base = companies.map((c) => cellFor(c, metric))
  const comparable = base
    .map((cell, index) => ({ cell, index }))
    .filter((x) => x.cell.status === 'ok' && x.cell.value !== null)

  const values = comparable.map((x) => x.cell.value as number)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const flat = max === min

  return base.map((cell, index) => {
    let rank: number | null = null
    if (cell.status === 'ok' && cell.value !== null && metric.direction !== 'neutral' && comparable.length > 1) {
      // Empate em toda a linha não é um gradiente: seria vermelho arbitrário.
      const normalized = flat ? 0.5 : (cell.value - min) / (max - min)
      rank = metric.direction === 'lower' ? 1 - normalized : normalized
    }

    const dist = snapshotSource.distribution(companies[index].sector, metric.key)
    const percentile =
      cell.status === 'ok' && cell.value !== null && dist
        ? sectorPercentile(cell.value, dist, metric.direction)
        : null

    return { ...cell, rank, sectorPercentile: percentile, distribution: dist }
  })
}

/** Formata o valor conforme a unidade da métrica. */
export function formatMetric(value: number | null, metric: MetricDef): string {
  if (value === null) return '—'

  switch (metric.unit) {
    case 'pct':
      return `${value.toLocaleString('pt-BR', {
        minimumFractionDigits: metric.decimals,
        maximumFractionDigits: metric.decimals,
      })}%`
    case 'x':
      return `${value.toLocaleString('pt-BR', {
        minimumFractionDigits: metric.decimals,
        maximumFractionDigits: metric.decimals,
      })}x`
    case 'brl':
      return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    case 'brlThousands':
      return formatBrlThousands(value)
    default:
      return String(value)
  }
}

/** A fonte entrega valores em milhares de reais; a tela mostra bi/mi. */
export function formatBrlThousands(thousands: number): string {
  const abs = Math.abs(thousands)
  if (abs >= 1_000_000_000) return `R$ ${(thousands / 1_000_000_000).toFixed(1)} tri`
  if (abs >= 1_000_000) return `R$ ${(thousands / 1_000_000).toFixed(1)} bi`
  if (abs >= 1_000) return `R$ ${(thousands / 1_000).toFixed(1)} mi`
  return `R$ ${thousands.toFixed(0)} mil`
}

export const STATUS_LABEL: Record<MetricCell['status'], string> = {
  ok: '',
  nm: 'n/m',
  na: 'n/a',
  missing: '—',
}

export const STATUS_HINT: Record<MetricCell['status'], string> = {
  ok: '',
  nm: 'Não significativo: múltiplo de preço negativo (a empresa teve prejuízo no período).',
  na: 'Não se aplica: a fonte não calcula enterprise value para bancos e seguradoras.',
  missing: 'Sem dado publicado na fonte para este trimestre.',
}

/**
 * Avisos sobre a seleção. A comparação continua — o usuário é quem decide —
 * mas o que compromete a leitura fica explícito.
 */
export function selectionWarnings(companies: Company[]): string[] {
  const warnings: string[] = []
  if (companies.length < 2) return warnings

  const sectors = new Set(companies.map((c) => c.sector))
  if (sectors.size > 1) {
    warnings.push(
      `Seleção com ${sectors.size} setores diferentes. Múltiplo de valuation só é comparável dentro do mesmo setor.`,
    )
  }

  const duplicated = companies.filter((c) => companies.some((o) => o !== c && o.cnpj === c.cnpj))
  if (duplicated.length) {
    const names = [...new Set(duplicated.map((c) => c.name))].join(', ')
    warnings.push(`${names}: classes da mesma empresa na comparação (mesmo CNPJ). Os múltiplos diferem só pelo preço da classe.`)
  }

  const banks = companies.filter((c) => c.evNotApplicable)
  if (banks.length && banks.length < companies.length) {
    warnings.push(
      `${banks.map((b) => b.ticker).join(', ')}: banco ou seguradora. Linhas de EV aparecem como não aplicável.`,
    )
  }

  const illiquid = companies.filter((c) => (c.metrics.avg_quarterly_volume_brl_thousands ?? 0) < 10_000)
  if (illiquid.length) {
    warnings.push(
      `${illiquid.map((c) => c.ticker).join(', ')}: liquidez muito baixa. O preço, e portanto todo múltiplo, pode estar defasado.`,
    )
  }

  return warnings
}

export type { MetricKey }
