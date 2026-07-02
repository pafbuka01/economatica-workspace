import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import type { LibraryTool } from '@/data/library'

/** Ferramenta de dados do conector MCP — nome técnico, exemplo de uso e bases exigidas. */
export function ToolCard({ tool }: { tool: LibraryTool }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard?.writeText(tool.prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <article className="flex h-full flex-col gap-3 rounded-[8px] border border-line bg-elevated p-4 transition duration-200 hover:-translate-y-0.5 hover:border-neutral-300">
      <div className="flex flex-col gap-1">
        <span className="self-start rounded-full bg-sel-bg px-1.5 py-1 text-[12px] font-medium leading-4 text-sel-text">
          {tool.category}
        </span>
        <h4 className="font-mono text-[15px] font-bold leading-6 text-ink">{tool.name}</h4>
        <p className="min-h-10 text-[12.25px] leading-5 text-muted">{tool.description}</p>
      </div>

      <div className="rounded-[6px] border border-line border-l-2 border-l-cyan-500 bg-surface px-3 py-2.5">
        <p className="line-clamp-2 font-mono text-[12.25px] leading-5 text-muted">{tool.prompt}</p>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2">
        <span className="text-[12px] leading-4 text-subdued">Base: {tool.required}</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-8 items-center justify-center gap-2 rounded-[4px] bg-neutral-200 px-3 text-sm font-medium text-ink transition duration-150 hover:bg-neutral-300 active:scale-[0.98]"
        >
          {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
          {copied ? 'Copiado!' : 'Copiar exemplo'}
        </button>
      </div>
    </article>
  )
}
