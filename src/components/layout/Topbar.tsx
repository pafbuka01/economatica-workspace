import { useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { navGroups } from '@/data/navigation'
import { BreadcrumbHomeIcon } from '@/lib/icons'
import { ProgressBar } from '@/components/ui/ProgressBar'

const titleByPath = new Map(
  navGroups.flatMap((g) => g.items).map((i) => [i.to, i.label]),
)

function TrialStatus() {
  return (
    <div className="hidden shrink-0 items-center gap-2 sm:flex">
      <span className="text-sm font-semibold leading-5 text-teal-500">Trial ativo</span>
      <span className="text-sm leading-5 text-subdued">7 dias</span>
      <ProgressBar value={60} className="w-[116px]" />
    </div>
  )
}

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { pathname } = useLocation()
  const title = titleByPath.get(pathname) ?? 'Home'

  return (
    <header className="h-[60px] shrink-0">
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
