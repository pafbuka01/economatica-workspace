import { cn } from '@/lib/cn'

/** Rótulo de seção da sidebar — monospace, caixa-alta (ex.: PRODUTOS, BIBLIOTECA). */
export function SectionLabel({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  return (
    <p
      className={cn(
        'font-mono text-[10px] font-bold uppercase tracking-[1.4px] text-nav-label',
        className,
      )}
    >
      {children}
    </p>
  )
}
