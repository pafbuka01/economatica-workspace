import { useEffect, useMemo, useRef, useState } from 'react'
import { Plus, Search, Sparkles, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatBrlThousands } from '@/data/comparator/compare'
import { snapshotSource } from '@/data/comparator/source'
import type { Company } from '@/data/comparator/types'

const MAX_SELECTION = 6

function ClassBadge({ company }: { company: Company }) {
  if (!company.shareClass) return null
  return (
    <span className="shrink-0 rounded-[3px] bg-elevated px-1 py-px text-[10px] font-medium leading-4 text-muted">
      {company.shareClass}
    </span>
  )
}

function ResultRow({
  company,
  onPick,
  disabled,
}: {
  company: Company
  onPick: (c: Company) => void
  disabled: boolean
}) {
  const cap = company.metrics.market_cap_brl_thousands
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onPick(company)}
      className={cn(
        'flex w-full items-center gap-2.5 px-2.5 py-2 text-left transition-colors',
        disabled ? 'cursor-not-allowed opacity-40' : 'hover:bg-sel-bg',
      )}
    >
      <span className="w-[68px] shrink-0 font-mono text-[13px] font-semibold text-ink">{company.ticker}</span>
      <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{company.name}</span>
      <ClassBadge company={company} />
      <span className="hidden shrink-0 text-[11px] text-muted sm:inline">{company.sector}</span>
      <span className="w-[76px] shrink-0 text-right font-mono text-[11px] text-muted">
        {cap ? formatBrlThousands(cap) : '—'}
      </span>
    </button>
  )
}

/**
 * Seleção das empresas comparadas. Três caminhos, porque "comparar empresas"
 * significa coisas diferentes: escolher na mão, puxar os pares do setor, ou
 * partir das mais líquidas do universo.
 */
export function CompanyPicker({
  selected,
  onChange,
}: {
  selected: Company[]
  onChange: (next: Company[]) => void
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  const results = useMemo(() => (query.trim() ? snapshotSource.search(query, 10) : []), [query])
  const full = selected.length >= MAX_SELECTION
  const selectedTickers = useMemo(() => new Set(selected.map((c) => c.ticker)), [selected])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const add = (company: Company) => {
    if (full || selectedTickers.has(company.ticker)) return
    onChange([...selected, company])
    setQuery('')
    setOpen(false)
  }

  const remove = (ticker: string) => onChange(selected.filter((c) => c.ticker !== ticker))

  /** Completa a seleção com os pares do setor da primeira empresa escolhida. */
  const fillWithPeers = () => {
    const anchor = selected[0]
    if (!anchor) return
    const peers = snapshotSource
      .peersOf(anchor.ticker, MAX_SELECTION)
      .filter((p) => !selectedTickers.has(p.ticker))
    onChange([...selected, ...peers].slice(0, MAX_SELECTION))
  }

  return (
    <div className="rounded-[10px] border border-line bg-surface p-3">
      <div className="flex flex-wrap items-center gap-2">
        {selected.map((company) => (
          <span
            key={company.ticker}
            className="inline-flex animate-pop items-center gap-1.5 rounded-[6px] border border-sel-border bg-sel-bg py-1 pl-2 pr-1 text-sel-text"
          >
            <span className="font-mono text-[13px] font-semibold">{company.ticker}</span>
            <span className="max-w-[120px] truncate text-[12px] opacity-70">{company.name}</span>
            <button
              type="button"
              onClick={() => remove(company.ticker)}
              aria-label={`Remover ${company.ticker}`}
              className="rounded-[4px] p-0.5 transition-colors hover:bg-black/10"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          </span>
        ))}

        <div ref={boxRef} className="relative min-w-[220px] flex-1">
          <div className="flex items-center gap-2 rounded-[6px] border border-line bg-canvas px-2.5 py-1.5 focus-within:border-brand-border">
            <Search className="size-4 shrink-0 text-muted" aria-hidden />
            <input
              value={query}
              disabled={full}
              onChange={(e) => {
                setQuery(e.target.value)
                setOpen(true)
              }}
              onFocus={() => setOpen(true)}
              placeholder={
                full
                  ? `Máximo de ${MAX_SELECTION} empresas`
                  : `Buscar entre ${snapshotSource.meta.tickerCount} ações da B3…`
              }
              className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-muted disabled:cursor-not-allowed"
            />
          </div>

          {open && results.length > 0 && (
            <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 max-h-[280px] animate-pop overflow-y-auto rounded-[8px] border border-line bg-surface py-1 shadow-card-xl">
              {results.map((company) => (
                <ResultRow
                  key={company.ticker}
                  company={company}
                  onPick={add}
                  disabled={selectedTickers.has(company.ticker)}
                />
              ))}
            </div>
          )}

          {open && query.trim() !== '' && results.length === 0 && (
            <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 animate-pop rounded-[8px] border border-line bg-surface px-3 py-2.5 text-[13px] text-muted shadow-card-xl">
              Nenhuma ação encontrada para “{query}”.
            </div>
          )}
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-hairline pt-2.5">
        <button
          type="button"
          onClick={fillWithPeers}
          disabled={!selected.length || full}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-[5px] px-2 py-1 text-[12px] font-medium transition-colors',
            !selected.length || full
              ? 'cursor-not-allowed text-disabled'
              : 'text-brand-text hover:bg-elevated',
          )}
        >
          <Sparkles className="size-3.5" aria-hidden />
          Preencher com pares do setor
        </button>

        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="inline-flex items-center gap-1.5 rounded-[5px] px-2 py-1 text-[12px] font-medium text-muted transition-colors hover:bg-elevated hover:text-ink"
          >
            <X className="size-3.5" aria-hidden />
            Limpar seleção
          </button>
        )}

        <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted">
          <Plus className="size-3" aria-hidden />
          {selected.length} de {MAX_SELECTION}
        </span>
      </div>
    </div>
  )
}

export { MAX_SELECTION }
