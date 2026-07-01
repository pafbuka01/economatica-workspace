import { useRef } from 'react'
import { videos, type VideoItem } from '@/data/videos'
import {
  CarouselLeftIcon,
  CarouselRightIcon,
  PlayCircleIcon,
  ClockIcon,
} from '@/lib/icons'

function VideoCard({ video }: { video: VideoItem }) {
  return (
    <article className="group flex w-[291px] shrink-0 cursor-pointer snap-start flex-col gap-3 rounded-[16px] border border-line bg-white px-3 pb-4 pt-3 transition duration-200 hover:-translate-y-0.5 hover:border-neutral-300">
      <div className="relative h-[157px] overflow-hidden rounded-[12px] bg-shade">
        <img
          src={video.thumb}
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
        <h3 className="text-base font-medium leading-6 text-ink">{video.title}</h3>
        <p className="line-clamp-2 text-sm leading-5 text-muted">{video.description}</p>
        <div className="flex items-center gap-1 text-muted">
          <ClockIcon className="size-4 shrink-0" aria-hidden />
          <span className="text-[12.25px] leading-5">{video.duration}</span>
        </div>
      </div>
    </article>
  )
}

function ArrowButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-8 items-center justify-center rounded-[4px] bg-neutral-200 text-ink transition duration-150 hover:bg-neutral-300 active:scale-95"
    >
      {children}
    </button>
  )
}

export function VideoCarousel() {
  const scroller = useRef<HTMLDivElement>(null)
  const scrollByCards = (dir: number) =>
    scroller.current?.scrollBy({ left: dir * 300, behavior: 'smooth' })

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold leading-6 text-ink">Veja como funciona</h2>
        <div className="flex items-center gap-1">
          <ArrowButton label="Anterior" onClick={() => scrollByCards(-1)}>
            <CarouselLeftIcon className="size-4" aria-hidden />
          </ArrowButton>
          <ArrowButton label="Próximo" onClick={() => scrollByCards(1)}>
            <CarouselRightIcon className="size-4" aria-hidden />
          </ArrowButton>
        </div>
      </div>

      <div
        ref={scroller}
        className="-mr-4 flex snap-x gap-2 overflow-x-auto pb-1 pr-4 sm:-mr-10 sm:pr-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {videos.map((video) => (
          <VideoCard key={video.title} video={video} />
        ))}
      </div>
    </section>
  )
}
