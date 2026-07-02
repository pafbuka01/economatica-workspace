import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import type { LibraryArtifact } from '@/data/library'

export function ArtifactCard({ artifact }: { artifact: LibraryArtifact }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard?.writeText(artifact.prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <article className="flex h-full flex-col gap-3 rounded-[8px] border border-line bg-elevated p-4 transition duration-200 hover:-translate-y-0.5 hover:border-neutral-300">
      <img
        src={artifact.image}
        alt=""
        className="h-[83px] w-full rounded-[8px] border border-line object-cover object-top"
      />
      <div className="flex flex-col gap-1">
        <h4 className="truncate text-base font-bold leading-6 text-ink">{artifact.title}</h4>
        <p className="line-clamp-2 min-h-10 text-[12.25px] leading-5 text-muted">
          {artifact.description}
        </p>
      </div>

      <div className="border-l border-accent bg-canvas px-2 py-1.5">
        <p className="line-clamp-3 font-mono text-[10.8px] leading-4 text-muted">
          {artifact.prompt}
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
