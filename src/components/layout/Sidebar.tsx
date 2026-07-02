import { cn } from '@/lib/cn'
import { LogoIcon, DotStatusIcon } from '@/lib/icons'
import { navGroups } from '@/data/navigation'
import { NavItem } from '@/components/ui/NavItem'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { ProgressBar } from '@/components/ui/ProgressBar'

/** Borda sutil usada no header do logo. */
const HAIRLINE = 'border-hairline'

function TrialCard() {
  return (
    <div className="flex w-full flex-col gap-1.5 rounded-[8px] border border-line bg-elevated p-[9px]">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center justify-between">
          <p className="text-xs leading-4 text-muted">Trial de 7 dias</p>
          <DotStatusIcon className="size-2 shrink-0" aria-hidden />
        </div>
        <p className="text-sm font-medium leading-[21px] text-ink">5 dias restantes</p>
      </div>
      <ProgressBar value={71} className="w-full" />
    </div>
  )
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav
      aria-label="Navegação do workspace"
      className="flex h-full w-[246px] max-w-[85vw] flex-col gap-3 rounded-[12px] border border-line bg-surface px-[15px] pb-[15px] pt-[21px]"
    >
      {/* Logo — fixo no topo */}
      <div className={cn('shrink-0 border-b px-2.5 pb-3', HAIRLINE)}>
        <div className="flex items-center gap-2">
          <LogoIcon className="size-8 shrink-0 text-[#072026] dark:text-ink" aria-hidden />
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

      {/* Trial — sempre visível no rodapé */}
      <div className="shrink-0 pt-1">
        <TrialCard />
      </div>
    </nav>
  )
}
