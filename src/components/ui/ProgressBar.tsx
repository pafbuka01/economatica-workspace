import { cn } from '@/lib/cn'

interface ProgressBarProps {
  /** Percentual preenchido (0–100). */
  value: number
  className?: string
}

/** Barra de progresso fina — usada no indicador de trial do topbar. */
export function ProgressBar({ value, className }: ProgressBarProps) {
  return (
    <div
      className={cn('h-1 overflow-hidden rounded-lg bg-neutral-200', className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-lg bg-teal-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
