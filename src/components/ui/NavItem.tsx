import { NavLink } from 'react-router-dom'
import type { IconComponent } from '@/lib/types'
import { cn } from '@/lib/cn'
import { DotStatusIcon, LockIcon } from '@/lib/icons'

export interface NavItemProps {
  to: string
  icon: IconComponent
  label: string
  /** Mostra o ponto verde de status (produtos ativos). */
  showDot?: boolean
  /** Rótulo de ação à direita (ex.: "conectar"). */
  action?: string
  /** Item bloqueado (cinza + cadeado, sem navegação). */
  disabled?: boolean
  /** Sub-item indentado sob o item anterior. */
  indent?: boolean
  /** Disparado ao clicar (ex.: fechar o drawer mobile). */
  onClick?: () => void
}

/** Item de navegação da sidebar, com estados ativo / idle / desabilitado. */
export function NavItem({
  to,
  icon: Icon,
  label,
  showDot,
  action,
  disabled,
  indent,
  onClick,
}: NavItemProps) {
  const row = cn(
    'flex items-center gap-2 rounded-lg border',
    indent ? 'py-[7px] pl-[33px] pr-[9px]' : 'px-[9px] py-[11px]',
  )

  if (disabled) {
    return (
      <div className={cn(row, 'cursor-not-allowed border-transparent')} aria-disabled>
        <span className="flex size-4 shrink-0 items-center justify-center text-disabled">
          <Icon className="size-full" aria-hidden />
        </span>
        <span className="flex-1 truncate text-sm font-medium leading-[21px] text-disabled">
          {label}
        </span>
        <LockIcon className="size-4 shrink-0 text-disabled" aria-hidden />
      </div>
    )
  }

  return (
    <NavLink
      to={to}
      end
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          row,
          'transition-colors',
          isActive
            ? 'border-sel-border bg-sel-bg'
            : 'border-transparent hover:bg-neutral-100',
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              'flex size-4 shrink-0 items-center justify-center',
              isActive ? 'text-brand' : 'text-muted',
            )}
          >
            <Icon className="size-full" aria-hidden />
          </span>
          <span
            className={cn(
              'flex-1 truncate text-sm font-medium leading-[21px]',
              isActive ? 'text-brand' : 'text-muted',
            )}
          >
            {label}
          </span>
          {showDot && <DotStatusIcon className="size-2 shrink-0" aria-hidden />}
          {action && (
            <span className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.5px] text-positive-500">
              {action}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}
