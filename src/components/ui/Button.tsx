import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/cn'
import { ArrowRightIcon } from '@/lib/icons'

type ButtonSize = 'sm' | 'md'
type ButtonVariant = 'primary' | 'secondary'

interface ButtonProps {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  withArrow?: boolean
  /** Ícone à esquerda (ex.: play em "Veja como funciona"). */
  leadingIcon?: ReactNode
  className?: string
  onClick?: () => void
  /** Quando definido, renderiza um <Link> de navegação em vez de <button>. */
  to?: string
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 rounded-[4px]',
  md: 'h-10 rounded-[6px]',
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-ink hover:bg-accent/85', // verde-limão
  secondary: 'bg-neutral-200 text-ink hover:bg-neutral-300',
}

/** Botão de ação. Primário = verde-limão da marca; secundário = cinza. */
export function Button({
  children,
  variant = 'primary',
  size = 'sm',
  withArrow = false,
  leadingIcon,
  className,
  onClick,
  to,
}: ButtonProps) {
  const classes = cn(
    'inline-flex min-w-[112px] items-center justify-center gap-2 px-3 text-sm font-medium transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
    sizeStyles[size],
    variantStyles[variant],
    className,
  )
  const content = (
    <>
      {leadingIcon}
      <span className="whitespace-nowrap">{children}</span>
      {withArrow && (
        <ArrowRightIcon className="size-4 shrink-0 -scale-x-100" aria-hidden />
      )}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    )
  }
  return (
    <button type="button" onClick={onClick} className={classes}>
      {content}
    </button>
  )
}

/** Botão desabilitado "Bloqueado na versão de teste" (cadeado). */
export function LockedButton({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      disabled
      className={cn(
        'inline-flex h-8 w-[238px] max-w-full cursor-not-allowed items-center justify-center gap-2 rounded-[4px] bg-neutral-200 px-3',
        'text-sm font-medium text-muted',
        className,
      )}
    >
      <Lock className="size-3.5 shrink-0" aria-hidden strokeWidth={2.25} />
      <span className="whitespace-nowrap">{children}</span>
    </button>
  )
}
