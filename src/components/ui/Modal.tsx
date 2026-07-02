import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'

/**
 * Base de todos os modais do sistema. Renderiza num portal em
 * document.body para escapar dos stacking contexts do shell (coluna
 * de conteúdo, vidros com backdrop-filter): o overlay cobre a
 * viewport inteira, menu lateral incluído. Esc e clique no overlay
 * fecham.
 */
export function Modal({
  onClose,
  ariaLabel,
  className,
  children,
}: {
  onClose: () => void
  ariaLabel: string
  className?: string
  children: ReactNode
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={cn(
          'relative w-full max-w-[600px] animate-pop rounded-[6px] border border-line bg-canvas p-6 shadow-card-xl dark:bg-surface',
          className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}
