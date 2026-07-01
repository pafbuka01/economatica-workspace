import type { Tutorial } from '@/data/terminal'
import { PlayCircleIcon, ClockIcon } from '@/lib/icons'

export function TutorialCard({ tutorial }: { tutorial: Tutorial }) {
  return (
    <article className="group flex cursor-pointer flex-col gap-3 rounded-[16px] border border-line px-3 pb-4 pt-3 transition duration-200 hover:-translate-y-0.5 hover:border-neutral-300">
      <div className="relative h-[157px] overflow-hidden rounded-[12px] bg-shade">
        <img
          src={tutorial.thumb}
          alt=""
          className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-black/30 transition-opacity duration-300 group-hover:opacity-60" />
        <PlayCircleIcon
          className="absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 group-hover:scale-105"
          aria-hidden
        />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="line-clamp-2 min-h-12 text-base font-medium leading-6 text-ink">
          {tutorial.title}
        </h3>
        <div className="flex items-center gap-1">
          {tutorial.highlight && (
            <span className="mr-0.5 text-[12.25px] font-medium leading-5 text-cyan-500">
              {tutorial.highlight}
            </span>
          )}
          <ClockIcon className="size-4 shrink-0 text-muted" aria-hidden />
          <span className="text-[12.25px] leading-5 text-muted">{tutorial.duration}</span>
        </div>
      </div>
    </article>
  )
}
