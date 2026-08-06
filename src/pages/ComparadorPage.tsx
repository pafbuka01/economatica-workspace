import { useMemo, useState } from 'react'
import { AlertTriangle, Info } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { CompanyPicker } from '@/features/comparador/CompanyPicker'
import { ComparisonTable } from '@/features/comparador/ComparisonTable'
import { SectorKpiBlock } from '@/features/comparador/SectorKpiBlock'
import { selectionWarnings } from '@/data/comparator/compare'
import { mostLiquid, sectorSummary, snapshotSource } from '@/data/comparator/source'
import type { Company } from '@/data/comparator/types'

/** Sugestões de partida — comparações que exercitam casos diferentes da base. */
const PRESETS: Array<{ label: string; tickers: string[]; note: string }> = [
  { label: 'Bancões', tickers: ['ITUB4', 'BBDC4', 'BBAS3', 'SANB11'], note: 'EV não se aplica' },
  { label: 'Mineração e siderurgia', tickers: ['VALE3', 'CMIN3', 'GGBR4', 'CSNA3'], note: 'múltiplo negativo' },
  { label: 'Papel e celulose', tickers: ['SUZB3', 'KLBN11', 'RANI3'], note: '' },
  { label: 'Petróleo', tickers: ['PETR4', 'PRIO3', 'RECV3'], note: '' },
]

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function FreshnessStamp() {
  const { fundamentalsQuarter, marketDataAsOf, tickerCount, companyCount } = snapshotSource.meta
  return (
    <div className="flex flex-wrap items-start gap-2 rounded-[8px] border border-line bg-elevated px-3 py-2 text-[12px] text-muted">
      <Info className="mt-px size-3.5 shrink-0" aria-hidden />
      <p className="min-w-0">
        Múltiplos cruzam <strong className="font-medium text-ink">preço de {formatDate(marketDataAsOf)}</strong> com{' '}
        <strong className="font-medium text-ink">fundamentos do {fundamentalsQuarter}</strong> — as duas pontas têm
        datas diferentes por natureza. Universo: {tickerCount} tickers, {companyCount} empresas após dedup por CNPJ.
        Fonte Economatica. Não é recomendação de investimento (CVM Res. 20/2021).
      </p>
    </div>
  )
}

function Warnings({ items }: { items: string[] }) {
  if (!items.length) return null
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((warning) => (
        <li
          key={warning}
          className="flex items-start gap-2 rounded-[8px] border border-line bg-surface px-3 py-2 text-[12px] text-muted"
        >
          <AlertTriangle className="mt-px size-3.5 shrink-0 text-badge-neg-text" aria-hidden />
          <span className="min-w-0">{warning}</span>
        </li>
      ))}
    </ul>
  )
}

function EmptyState({ onPick }: { onPick: (tickers: string[]) => void }) {
  const sectors = useMemo(() => sectorSummary(), [])
  const liquid = useMemo(() => mostLiquid(6), [])

  return (
    <div className="flex flex-col gap-5 rounded-[10px] border border-dashed border-line bg-surface px-5 py-6">
      <div>
        <h2 className="text-[15px] font-semibold text-ink">Escolha até 6 empresas para comparar</h2>
        <p className="mt-1 text-[13px] text-muted">
          Busque por ticker ou nome, ou comece por uma das comparações abaixo.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onPick(preset.tickers)}
            className="group flex flex-col items-start gap-0.5 rounded-[8px] border border-line bg-canvas px-3 py-2 text-left transition-colors hover:border-sel-border hover:bg-sel-bg"
          >
            <span className="text-[13px] font-medium text-ink">{preset.label}</span>
            <span className="font-mono text-[11px] text-muted">{preset.tickers.join(' · ')}</span>
            {preset.note && <span className="text-[10px] text-subdued">expõe {preset.note}</span>}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 border-t border-hairline pt-4">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-nav-label">
          Mais líquidas do universo
        </span>
        <div className="flex flex-wrap gap-1.5">
          {liquid.map((company) => (
            <button
              key={company.ticker}
              type="button"
              onClick={() => onPick([company.ticker])}
              className="rounded-[5px] border border-line bg-canvas px-2 py-1 font-mono text-[12px] text-ink transition-colors hover:border-sel-border hover:bg-sel-bg"
            >
              {company.ticker}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-hairline pt-4">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-nav-label">
          Cobertura por setor
        </span>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {sectors.map(({ sector, companies }) => (
            <span key={sector} className="text-[12px] text-muted">
              {sector} <span className="font-mono text-subdued">{companies}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ComparadorPage() {
  const [selected, setSelected] = useState<Company[]>([])

  const pickTickers = (tickers: string[]) => {
    const found = tickers.map((t) => snapshotSource.get(t)).filter((c): c is Company => Boolean(c))
    setSelected(found.slice(0, 6))
  }

  const warnings = useMemo(() => selectionWarnings(selected), [selected])

  return (
    <PageContainer className="animate-page py-6">
      <header className="mb-4">
        <h1 className="text-[22px] font-semibold leading-tight text-ink">Comparador de empresas</h1>
        <p className="mt-1 text-[13px] text-muted">
          Compare ações da B3 lado a lado em valuation, rentabilidade, alavancagem, retorno e risco, com a
          posição de cada uma na distribuição do próprio setor.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        <CompanyPicker selected={selected} onChange={setSelected} />
        <FreshnessStamp />

        {selected.length === 0 && <EmptyState onPick={pickTickers} />}

        {selected.length === 1 && (
          <div className="rounded-[10px] border border-dashed border-line bg-surface px-5 py-6 text-center">
            <p className="text-[13px] text-muted">
              Adicione ao menos mais uma empresa, ou use{' '}
              <strong className="font-medium text-ink">Preencher com pares do setor</strong> para montar a
              comparação automaticamente.
            </p>
          </div>
        )}

        {selected.length >= 2 && (
          <>
            <Warnings items={warnings} />
            <ComparisonTable companies={selected} />
            <Legend />
            <SectorKpiBlock companies={selected} />
          </>
        )}
      </div>
    </PageContainer>
  )
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-1 text-[11px] text-muted">
      <span className="inline-flex items-center gap-1.5">
        <span className="size-3 rounded-[3px]" style={{ backgroundColor: 'rgba(23, 178, 106, 0.2)' }} />
        melhor da seleção
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="size-3 rounded-[3px]" style={{ backgroundColor: 'rgba(220, 38, 38, 0.2)' }} />
        pior da seleção
      </span>
      <span>
        <strong className="font-mono font-normal text-ink">P72</strong> percentil no setor (100 = melhor)
      </span>
      <span>
        <strong className="font-mono font-normal text-ink">n/m</strong> não significativo (múltiplo negativo)
      </span>
      <span>
        <strong className="font-mono font-normal text-ink">n/a</strong> não se aplica ao setor
      </span>
    </div>
  )
}
