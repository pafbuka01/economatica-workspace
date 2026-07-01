import { useRef, type ReactNode } from 'react'
import { CarouselLeftIcon, CarouselRightIcon } from '@/lib/icons'

function ArrowButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: ReactNode
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

/**
 * Seção com carrossel horizontal: título + setas, cards que sangram até a
 * borda direita da tela (mesmo padrão do "Veja como funciona" da Home).
 */
export function CarouselSection({ title, children }: { title: string; children: ReactNode }) {
  const scroller = useRef<HTMLDivElement>(null)
  const scrollByCards = (dir: number) =>
    scroller.current?.scrollBy({ left: dir * 372, behavior: 'smooth' })

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold leading-6 text-ink">{title}</h2>
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
        className="-mr-4 flex snap-x gap-3 overflow-x-auto pb-1 pr-4 sm:-mr-10 sm:pr-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </section>
  )
}
