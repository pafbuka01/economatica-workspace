import { useMemo } from 'react'
import { ExternalLink, FileText } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatKpi, kpiValue, kpisForSelection } from '@/data/comparator/sectorKpis'
import type { KpiDef } from '@/data/comparator/sectorKpis'
import type { Company } from '@/data/comparator/types'

/** Mesmo gradiente da tabela de fundamentos, já orientado pela direção. */
function heatStyle(rank: number | null) {
  if (rank === null) return undefined
  const strength = Math.abs(rank - 0.5) * 2
  if (strength < 0.15) return undefined
  const alpha = 0.06 + strength * 0.16
  const rgb = rank >= 0.5 ? '23, 178, 106' : '220, 38, 38'
  return { backgroundColor: `rgba(${rgb}, ${alpha.toFixed(3)})` }
}

function KpiRow({ def, companies }: { def: KpiDef; companies: Company[] }) {
  const cells = companies.map((c) => ({ company: c, entry: kpiValue(c.ticker, def.code) }))
  const values = cells.map((c) => c.entry?.value).filter((v): v is number => v !== undefined)

  const min = Math.min(...values)
  const max = Math.max(...values)
  const flat = max === min

  return (
    <tr className="group">
      <th
        scope="row"
        className="sticky left-0 z-10 border-b border-hairline bg-surface px-3 py-2 text-left text-[13px] font-normal text-ink group-hover:bg-zebra"
      >
        <span
          className={cn(def.hint && 'cursor-help border-b border-dotted border-line')}
          title={def.hint}
        >
          {def.label}
        </span>
      </th>

      {cells.map(({ company, entry }) => {
        if (!entry) {
          return (
            <td key={company.ticker} className="border-b border-hairline px-3 py-2 text-right align-middle">
              <span
                className="cursor-help font-mono text-[13px] text-disabled"
                title="Não publicado nos releases auditados, ou fora da coleta deste snapshot. A ausência é do dado, não um zero."
              >
                não publicado
              </span>
            </td>
          )
        }

        let rank: number | null = null
        if (def.direction !== 'neutral' && values.length > 1) {
          const normalized = flat ? 0.5 : (entry.value - min) / (max - min)
          rank = def.direction === 'lower' ? 1 - normalized : normalized
        }

        return (
          <td
            key={company.ticker}
            className="border-b border-hairline px-3 py-2 text-right align-middle"
            style={heatStyle(rank)}
          >
            <div className="flex flex-col items-end gap-0.5">
              <span className="font-mono text-[13px] tabular-nums text-ink">{formatKpi(entry.value, def)}</span>
              {/* Contrato de auditabilidade: o número nunca aparece sem a fonte. */}
              <a
                href={entry.citation.url}
                target="_blank"
                rel="noreferrer"
                title={`${entry.citation.document}, p. ${entry.citation.page}\n\n“${entry.citation.snippet}”\n\nConfiança da extração: ${(entry.citation.confidence * 100).toFixed(0)}%`}
                className="inline-flex items-center gap-0.5 text-[10px] text-muted underline-offset-2 transition-colors hover:text-brand-text hover:underline"
              >
                <FileText className="size-2.5" aria-hidden />
                {entry.citation.document}
                <ExternalLink className="size-2.5" aria-hidden />
              </a>
            </div>
          </td>
        )
      })}
    </tr>
  )
}

/**
 * Bloco de KPI gerencial do setor. Só aparece quando todas as selecionadas
 * compartilham o segmento — Basileia só significa alguma coisa entre bancos.
 */
export function SectorKpiBlock({ companies }: { companies: Company[] }) {
  const defs = useMemo(() => kpisForSelection(companies.map((c) => c.segment)), [companies])

  // O catálogo do setor é maior que a coleta deste snapshot. Linha sem nenhum
  // valor viraria ruído na tabela, então vira nota de rodapé — o usuário
  // continua sabendo que o indicador existe para o setor.
  const { covered, uncovered } = useMemo(() => {
    const withValue = (def: KpiDef) => companies.some((c) => kpiValue(c.ticker, def.code))
    return {
      covered: (defs ?? []).filter(withValue),
      uncovered: (defs ?? []).filter((d) => !withValue(d)),
    }
  }, [defs, companies])

  if (!defs?.length || !covered.length) return null

  const segment = companies[0].segment

  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 px-1">
        <h2 className="text-[14px] font-semibold text-ink">Indicadores gerenciais · {segment}</h2>
        <p className="text-[12px] text-muted">
          Extraídos dos releases oficiais, cada número com o documento CVM de origem.
        </p>
      </div>

      <div className="overflow-x-auto rounded-[10px] border border-line bg-surface">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-20 min-w-[184px] border-b border-line bg-surface px-3 py-2 text-left text-[12px] font-medium text-muted"
              >
                Indicador
              </th>
              {companies.map((c) => (
                <th
                  key={c.ticker}
                  scope="col"
                  className="min-w-[148px] border-b border-line px-3 py-2 text-right font-mono text-[13px] font-semibold text-ink"
                >
                  {c.ticker}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {covered.map((def) => (
              <KpiRow key={def.code} def={def} companies={companies} />
            ))}
          </tbody>
        </table>
      </div>

      {uncovered.length > 0 && (
        <p className="px-1 text-[11px] text-subdued">
          O catálogo de {segment} tem ainda {uncovered.map((d) => d.label).join(', ')} — fora da coleta deste
          snapshot. Rode <code className="font-mono">scripts/build-snapshot.mjs</code> com esses códigos para
          incluí-los.
        </p>
      )}
    </section>
  )
}
