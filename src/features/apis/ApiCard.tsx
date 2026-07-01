import type { ApiService } from '@/data/apis'

const BAR_COUNT = 50

/**
 * Alturas pseudo-aleatórias porém determinísticas (mesmo desenho a cada render),
 * imitando o gráfico de atividade do comp: variação orgânica com picos ao final.
 */
function barHeight(i: number): number {
  const wave = (Math.sin(i * 1.7) * Math.sin(i * 0.43) + 1) / 2 // 0..1
  const tail = i > BAR_COUNT - 8 ? 0.9 : 0 // últimas barras mais altas
  return 24 + Math.round(wave * 20 + tail * 34)
}

function ActivityChart() {
  return (
    <div className="flex h-[47px] items-end justify-between" aria-hidden>
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <div
          key={i}
          className="w-[3px] rounded-t-[1px] bg-[#40bc84]"
          style={{ height: `${Math.min(barHeight(i), 100)}%` }}
        />
      ))}
    </div>
  )
}

interface ApiCardProps {
  api: ApiService
  onDetails?: (id: string) => void
}

export function ApiCard({ api, onDetails }: ApiCardProps) {
  return (
    <article className="flex flex-col gap-4 rounded-[8px] border border-line bg-elevated p-4 transition duration-200 hover:-translate-y-0.5 hover:border-neutral-300">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold leading-6 text-ink">{api.name}</h3>
          <p className="mt-1 flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-full bg-success-500" />
            <span className="text-xs font-medium leading-4 text-positive-text">
              Em funcionamento
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => onDetails?.(api.id)}
          className="inline-flex h-10 min-w-[112px] shrink-0 items-center justify-center rounded-[6px] bg-neutral-200 px-3 text-sm font-medium text-ink transition duration-150 hover:bg-neutral-300 active:scale-[0.98]"
        >
          Detalhes
        </button>
      </div>
      <ActivityChart />
    </article>
  )
}
