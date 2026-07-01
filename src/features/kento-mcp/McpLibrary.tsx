import { useState } from 'react'
import { cn } from '@/lib/cn'
import { libraryPrompts, libraryTabs } from '@/data/mcp'
import { PromptCard } from '@/features/library/PromptCard'

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
        {libraryPrompts.slice(0, 6).map((p) => (
          <PromptCard key={p.title} prompt={p} />
        ))}
      </div>
    </section>
  )
}
