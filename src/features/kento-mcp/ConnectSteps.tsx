import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/cn'
import { connectSteps } from '@/data/mcp'
import tutorialImg from '@/assets/mcp-tutorial.png'

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard?.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm leading-5">
      <span className="text-muted">{label}:</span>
      <span className="inline-flex min-w-0 items-center gap-2 rounded-[6px] border border-line bg-white px-2 py-1">
        <span className="truncate font-mono text-[12.25px] text-ink">{value}</span>
        <button
          type="button"
          onClick={copy}
          aria-label={`Copiar ${label}`}
          className="shrink-0 text-muted transition-colors hover:text-ink"
        >
          {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
        </button>
      </span>
    </div>
  )
}

export function ConnectSteps() {
  const last = connectSteps.length - 1
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-base font-bold leading-6 text-ink">Passo a passo para conectar</h3>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_482px]">
        <ol className="flex flex-col">
          {connectSteps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="size-6 shrink-0 rounded-full bg-accent" />
                {i < last && <div className="my-1 w-0.5 grow bg-line" />}
              </div>
              <div className={cn('min-w-0 flex-1', i < last && 'pb-6')}>
                <p className="text-sm font-bold leading-6 text-ink">Passo {i + 1}</p>
                <p className="mt-1 text-sm leading-5 text-muted">{step.description}</p>
                {step.fields && (
                  <div className="mt-3 flex flex-col gap-2">
                    {step.fields.map((f) => (
                      <CopyField key={f.label} label={f.label} value={f.value} />
                    ))}
                  </div>
                )}
                {step.note && <p className="mt-2 text-sm leading-5 text-muted">{step.note}</p>}
              </div>
            </li>
          ))}
        </ol>
        <div className="hidden lg:block">
          <img
            src={tutorialImg}
            alt="Exemplo do conector Economatica configurado no assistente"
            className="w-full rounded-[12px] border border-line"
          />
        </div>
      </div>
    </section>
  )
}
