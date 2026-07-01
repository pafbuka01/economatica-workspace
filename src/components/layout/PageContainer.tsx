import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Limita a largura do conteúdo em telas grandes e o centraliza na área de
 * conteúdo (à direita da sidebar). Mantém o padding lateral em telas menores.
 */
export function PageContainer({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('mx-auto w-full max-w-[1440px] px-4 sm:px-10', className)}>
      {children}
    </div>
  )
}
