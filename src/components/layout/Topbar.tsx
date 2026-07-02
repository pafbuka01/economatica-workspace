import { useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/cn'
import { navGroups } from '@/data/navigation'
import { BreadcrumbHomeIcon } from '@/lib/icons'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { UserMenu } from './UserMenu'

const titleByPath = new Map(
  navGroups.flatMap((g) => g.items).map((i) => [i.to, i.label]),
)

function TrialStatus() {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <div className="hidden items-center gap-2 sm:flex">
        <span className="text-sm font-semibold leading-5 text-teal-500">Trial</span>
        <span className="whitespace-nowrap text-sm leading-5 text-subdued">
          5 dias restantes
        </span>
        <ProgressBar value={71} className="w-[116px]" />
      </div>
      <UserMenu />
    </div>
  )
}

export function Topbar({ onMenuClick, scrolled }: { onMenuClick?: () => void; scrolled?: boolean }) {
  const { pathname } = useLocation()
  const title = titleByPath.get(pathname) ?? 'Home'

  // Flutua sobre o conteúdo. No topo é transparente (o glow da Home corre
  // uniforme, sem degrau contra a sidebar); o vidro só aparece quando o
  // conteúdo rola por baixo, para manter o texto do header legível.
  return (
    <header
      className={cn(
        'absolute inset-x-0 top-0 z-20 h-[60px] backdrop-blur-md transition-colors duration-300',
        scrolled ? 'bg-canvas/85 dark:bg-canvas/70' : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between gap-2 px-4 sm:px-10">
        <div className="flex min-w-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Abrir menu de navegação"
            className="-ml-1 flex size-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-neutral-100 lg:hidden"
          >
            <Menu className="size-5" aria-hidden />
          </button>
          <BreadcrumbHomeIcon className="size-4 shrink-0 text-neutral-400" aria-hidden />
          <span className="truncate text-sm font-medium leading-[21px] text-subdued">
            {title}
          </span>
        </div>
        <TrialStatus />
      </div>
    </header>
  )
}
