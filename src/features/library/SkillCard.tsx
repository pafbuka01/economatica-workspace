import { Download } from 'lucide-react'
import type { LibrarySkill } from '@/data/library'

export function SkillCard({ skill }: { skill: LibrarySkill }) {
  return (
    <article className="flex flex-col gap-3 rounded-[8px] border border-line bg-elevated p-4 transition duration-200 hover:-translate-y-0.5 hover:border-neutral-300">
      <div className="flex flex-col gap-1">
        <span className="self-start rounded-full bg-sel-bg px-1.5 py-1 text-[12px] font-medium leading-4 text-brand">
          {skill.category}
        </span>
        <h4 className="text-base font-bold leading-6 text-ink">{skill.name}</h4>
        <p className="min-h-10 text-[12.25px] leading-5 text-muted">{skill.description}</p>
      </div>

      <div className="flex gap-1">
        <button
          type="button"
          className="inline-flex h-8 min-w-0 flex-1 items-center justify-center gap-2 rounded-[4px] bg-neutral-200 px-3 text-sm font-medium text-ink transition duration-150 hover:bg-neutral-300 active:scale-[0.98]"
        >
          <Download className="size-4 shrink-0" aria-hidden />
          Baixar .zip
        </button>
        <button
          type="button"
          className="inline-flex h-8 min-w-0 flex-1 items-center justify-center rounded-[4px] bg-accent px-3 text-sm font-medium text-ink transition duration-150 hover:bg-accent/85 active:scale-[0.98]"
        >
          Instalar Skill
        </button>
      </div>
    </article>
  )
}
