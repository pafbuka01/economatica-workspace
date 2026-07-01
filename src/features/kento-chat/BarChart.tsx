import type { ChartData } from '@/data/chat'

const TICKS = [1000, 800, 600, 400, 200, 0]

/** Gráfico de barras empilhadas (realizado ciano + projeção cinza), CSS puro. */
export function BarChart({ data }: { data: ChartData }) {
  return (
    <div className="flex w-full gap-3">
      {/* Eixo Y */}
      <div className="flex h-[182px] shrink-0 flex-col justify-between text-right text-[12px] leading-none text-[#94979c]">
        {TICKS.map((t) => (
          <span key={t}>{t.toLocaleString('pt-BR')}</span>
        ))}
      </div>

      <div className="min-w-0 flex-1">
        {/* Área do plot */}
        <div className="relative h-[182px]">
          {/* Gridlines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {TICKS.map((t) => (
              <div key={t} className="h-px w-full bg-neutral-200" />
            ))}
          </div>
          {/* Barras */}
          <div className="absolute inset-0 flex items-end justify-between gap-1.5">
            {data.bars.map((b) => (
              <div key={b.month} className="flex h-full min-w-0 flex-1 flex-col justify-end">
                <div
                  className="w-full bg-neutral-300"
                  style={{ height: `${((b.total - b.value) / data.max) * 100}%` }}
                />
                <div
                  className="w-full bg-cyan-500"
                  style={{ height: `${(b.value / data.max) * 100}%` }}
                />
              </div>
            ))}
          </div>
        </div>
        {/* Eixo X */}
        <div className="mt-2 flex justify-between gap-1.5 text-[11px] leading-none text-[#94979c]">
          {data.bars.map((b) => (
            <span key={b.month} className="min-w-0 flex-1 text-center">
              {b.month}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
