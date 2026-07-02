import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import type { LibraryPrompt } from '@/data/library'

export function PromptCard({ prompt }: { prompt: LibraryPrompt }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard?.writeText(prompt.prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <article className="flex h-full flex-col gap-3 rounded-[8px] border border-line bg-elevated p-4 transition duration-200 hover:-translate-y-0.5 hover:border-neutral-300">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap gap-1.5">
          {prompt.tags.map((t) => (
            <span
              key={t}
              className="rounded-[6px] bg-surface px-1.5 py-1 text-[12px] font-medium leading-4 text-muted"
            >
              {t}
            </span>
          ))}
        </div>
        <h4 className="mt-1 text-base font-bold leading-6 text-ink">{prompt.title}</h4>
        <p className="text-sm leading-5 text-muted">{prompt.description}</p>
      </div>

      <div className="rounded-[6px] border border-line border-l-2 border-l-cyan-500 bg-surface px-3 py-2.5">
        <p className="line-clamp-2 font-mono text-[12.25px] leading-5 text-muted">
          {prompt.prompt}
        </p>
      </div>

      <button
        type="button"
        onClick={copy}
        className="mt-auto inline-flex h-8 items-center justify-center gap-2 self-start rounded-[4px] bg-accent px-3 text-sm font-medium text-on-accent transition duration-150 hover:bg-accent/85 active:scale-[0.98]"
      >
        {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
        {copied ? 'Copiado!' : 'Copiar prompt'}
      </button>
    </article>
  )
}
