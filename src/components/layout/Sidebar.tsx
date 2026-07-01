import { ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { LogoIcon } from '@/lib/icons'
import { navGroups } from '@/data/navigation'
import { NavItem } from '@/components/ui/NavItem'
import { SectionLabel } from '@/components/ui/SectionLabel'

/** Borda sutil usada no header do logo. */
const HAIRLINE = 'border-[rgba(12,28,24,0.12)]'

function ProfileCard() {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-1.5 rounded-[8px] border border-line bg-elevated p-[9px] text-left transition-colors hover:bg-neutral-200/60"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent">
        <span className="text-sm font-semibold text-ink">PA</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-[21px] text-ink">
          Pedro Albuquerque
        </p>
        <p className="truncate text-xs leading-4 text-muted">Plano Kento Pro</p>
      </div>
      <ChevronsUpDown className="size-4 shrink-0 text-muted" aria-hidden />
    </button>
  )
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav
      aria-label="Navegação do workspace"
      className="flex h-full w-[246px] max-w-[85vw] flex-col gap-3 rounded-[12px] border border-line bg-white px-[15px] pb-[15px] pt-[21px]"
    >
      {/* Logo — fixo no topo */}
      <div className={cn('shrink-0 border-b px-2.5 pb-3', HAIRLINE)}>
        <div className="flex items-center gap-2">
          <LogoIcon className="size-8 shrink-0" aria-hidden />
          <span className="text-base font-semibold tracking-[1px] text-neutral-500">
            CENTRAL
          </span>
        </div>
      </div>

      {/* Grupos de navegação — rolam quando faltar altura */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-1 [scrollbar-width:thin]">
        {navGroups.map((group, i) => (
          <div key={group.label ?? `group-${i}`} className="flex shrink-0 flex-col gap-0.5">
            {group.label && <SectionLabel className="mb-0.5">{group.label}</SectionLabel>}
            {group.items.map((item) => (
              <NavItem key={item.to} {...item} onClick={onNavigate} />
            ))}
          </div>
        ))}
      </div>

      {/* Perfil — sempre visível no rodapé */}
      <div className="shrink-0 pt-1">
        <ProfileCard />
      </div>
    </nav>
  )
}
