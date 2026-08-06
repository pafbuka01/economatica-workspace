import { Fragment, useMemo } from 'react'
import { cn } from '@/lib/cn'
import { BLOCK_LABELS, BLOCK_ORDER, metricsOfBlock } from '@/data/comparator/metrics'
import { STATUS_HINT, STATUS_LABEL, buildRow, formatMetric } from '@/data/comparator/compare'
import type { Company, MetricCell, MetricDef } from '@/data/comparator/types'

/**
 * Tinta da célula. O gradiente é sempre "melhor = verde", já orientado pela
 * direção da métrica em `buildRow` — em P/L o menor valor chega aqui com rank
 * alto. Alfa baixo para o número continuar legível nos dois temas.
 */
function heatStyle(rank: number | null) {
  if (rank === null) return undefined
  // Faixa morna do meio não ganha cor: só os extremos comunicam.
  const strength = Math.abs(rank - 0.5) * 2
  if (strength < 0.15) return undefined
  const alpha = 0.06 + strength * 0.16
  const rgb = rank >= 0.5 ? '23, 178, 106' : '220, 38, 38'
  return { backgroundColor: `rgba(${rgb}, ${alpha.toFixed(3)})` }
}

/** Pílula de percentil: onde a empresa está na distribuição do próprio setor. */
function PercentileBadge({ cell }: { cell: MetricCell }) {
  if (cell.sectorPercentile === null || !cell.distribution) return null

  const p = cell.sectorPercentile
  const tone =
    p >= 75 ? 'text-badge-pos-text' : p <= 25 ? 'text-badge-neg-text' : 'text-muted'

  return (
    <span
      className={cn('font-mono text-[10px] leading-none', tone)}
      title={`Percentil ${p} no setor (${cell.distribution.n} empresas). Mediana do setor: ${cell.distribution.median}.`}
    >
      P{p}
    </span>
  )
}

function Cell({ cell, metric }: { cell: MetricCell; metric: MetricDef }) {
  if (cell.status !== 'ok') {
    return (
      <td className="border-b border-hairline px-3 py-2 text-right align-middle">
        <span className="cursor-help font-mono text-[13px] text-disabled" title={STATUS_HINT[cell.status]}>
          {STATUS_LABEL[cell.status]}
        </span>
      </td>
    )
  }

  return (
    <td className="border-b border-hairline px-3 py-2 text-right align-middle" style={heatStyle(cell.rank)}>
      <div className="flex items-baseline justify-end gap-1.5">
        <span className="font-mono text-[13px] tabular-nums text-ink">{formatMetric(cell.value, metric)}</span>
        <PercentileBadge cell={cell} />
      </div>
    </td>
  )
}

function CompanyHeader({ company }: { company: Company }) {
  return (
    <th scope="col" className="min-w-[148px] border-b border-line px-3 py-2.5 text-right align-bottom">
      <div className="flex flex-col items-end gap-0.5">
        <span className="font-mono text-[14px] font-semibold leading-tight text-ink">{company.ticker}</span>
        <span className="max-w-[140px] truncate text-[12px] font-normal leading-tight text-muted">
          {company.name}
        </span>
        <span className="max-w-[140px] truncate text-[10px] font-normal leading-tight text-subdued">
          {company.segment ?? company.sector}
        </span>
      </div>
    </th>
  )
}

export function ComparisonTable({ companies }: { companies: Company[] }) {
  /** Blocos vazios para a seleção atual não viram seções em branco. */
  const blocks = useMemo(
    () =>
      BLOCK_ORDER.map((block) => {
        const rows = metricsOfBlock(block)
          .map((metric) => ({ metric, cells: buildRow(companies, metric) }))
          .filter((row) => row.cells.some((c) => c.status === 'ok'))
        return { block, rows }
      }).filter((b) => b.rows.length > 0),
    [companies],
  )

  return (
    <div className="overflow-x-auto rounded-[10px] border border-line bg-surface">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 z-10 bg-surface">
          <tr>
            <th
              scope="col"
              className="sticky left-0 z-20 min-w-[184px] border-b border-line bg-surface px-3 py-2.5 text-left align-bottom text-[12px] font-medium text-muted"
            >
              Métrica
            </th>
            {companies.map((company) => (
              <CompanyHeader key={company.ticker} company={company} />
            ))}
          </tr>
        </thead>

        <tbody>
          {blocks.map(({ block, rows }) => (
            <Fragment key={block}>
              <tr>
                <th
                  scope="colgroup"
                  colSpan={companies.length + 1}
                  className="sticky left-0 border-b border-hairline bg-zebra px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wide text-nav-label"
                >
                  {BLOCK_LABELS[block]}
                </th>
              </tr>
              {rows.map(({ metric, cells }) => (
                <tr key={metric.key} className="group">
                  <th
                    scope="row"
                    className="sticky left-0 z-10 border-b border-hairline bg-surface px-3 py-2 text-left text-[13px] font-normal text-ink group-hover:bg-zebra"
                  >
                    <span className={cn(metric.hint && 'cursor-help border-b border-dotted border-line')} title={metric.hint}>
                      {metric.label}
                    </span>
                  </th>
                  {cells.map((cell, i) => (
                    <Cell key={companies[i].ticker} cell={cell} metric={metric} />
                  ))}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
