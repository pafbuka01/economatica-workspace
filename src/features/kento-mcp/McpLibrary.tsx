import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/cn'
import { libraryPrompts, libraryTabs, type LibraryPrompt } from '@/data/mcp'

function PromptCard({ prompt }: { prompt: LibraryPrompt }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard?.writeText(prompt.prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <article className="flex flex-col gap-3 rounded-[8px] border border-line bg-elevated p-4">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap gap-1.5">
          {prompt.tags.map((t) => (
            <span
              key={t}
              className="rounded-[6px] bg-white px-1.5 py-1 text-[12px] font-medium leading-4 text-muted"
            >
              {t}
            </span>
          ))}
        </div>
        <h4 className="mt-1 text-base font-bold leading-6 text-ink">{prompt.title}</h4>
        <p className="text-sm leading-5 text-muted">{prompt.description}</p>
      </div>

      <div className="rounded-[6px] border border-line border-l-2 border-l-cyan-500 bg-white px-3 py-2.5">
        <p className="line-clamp-2 font-mono text-[12.25px] leading-5 text-muted">
          {prompt.prompt}
        </p>
      </div>

      <button
        type="button"
        onClick={copy}
        className="inline-flex h-8 items-center justify-center gap-2 self-start rounded-[4px] bg-accent px-3 text-sm font-medium text-ink transition-colors hover:bg-accent/85"
      >
        {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
        {copied ? 'Copiado!' : 'Copiar prompt'}
      </button>
    </article>
  )
}

export function McpLibrary() {
  const [tab, setTab] = useState(libraryTabs[0])

  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-base font-bold leading-6 text-ink">Biblioteca</h3>
      <div className="flex gap-4 overflow-x-auto border-b border-line">
        {libraryTabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'shrink-0 border-b pb-2 pt-1 text-sm font-medium transition-colors',
              tab === t
                ? 'border-brand text-brand'
                : 'border-transparent text-neutral-400 hover:text-muted',
            )}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {libraryPrompts.map((p) => (
          <PromptCard key={p.title} prompt={p} />
        ))}
      </div>
    </section>
  )
}
