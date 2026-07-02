import type { LibraryRecommendation } from '@/lib/workspace-bff'

/**
 * Card de objeto recomendado pelo filtro de perfil (BFF com fallback local).
 * Mesmo desenho dos demais cards da Biblioteca: tags, título, descrição e
 * primeiro prompt em destaque.
 */
export function RecommendationCard({
  recommendation,
  onOpen,
}: {
  recommendation: LibraryRecommendation
  onOpen?: (recommendation: LibraryRecommendation) => void
}) {
  return (
    <article className="flex h-full flex-col gap-3 rounded-[8px] border border-line bg-elevated p-4 transition duration-200 hover:-translate-y-0.5 hover:border-neutral-300">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-[6px] bg-surface px-1.5 py-1 text-[12px] font-medium leading-4 text-muted">
            {recommendation.objectType}
          </span>
          <span className="rounded-[6px] bg-surface px-1.5 py-1 text-[12px] font-medium leading-4 text-muted">
            {recommendation.difficulty}
          </span>
        </div>
        <h4 className="mt-1 text-base font-bold leading-6 text-ink">{recommendation.title}</h4>
        <p className="text-sm leading-5 text-muted">{recommendation.description}</p>
      </div>

      {recommendation.firstPrompt && (
        <div className="rounded-[6px] border border-line border-l-2 border-l-cyan-500 bg-surface px-3 py-2.5">
          <p className="line-clamp-2 font-mono text-[12.25px] leading-5 text-muted">{recommendation.firstPrompt}</p>
        </div>
      )}

      <div className="mt-auto flex flex-col gap-2">
        <p className="text-[12px] leading-4 text-subdued">{recommendation.recommendationReason}</p>
        <button
          type="button"
          onClick={() => onOpen?.(recommendation)}
          className="inline-flex h-8 items-center justify-center gap-2 self-start rounded-[4px] bg-accent px-3 text-sm font-medium text-on-accent transition duration-150 hover:bg-accent/85 active:scale-[0.98]"
        >
          {recommendation.cta}
        </button>
      </div>
    </article>
  )
}
