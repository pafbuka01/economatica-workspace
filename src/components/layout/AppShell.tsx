import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

/**
 * Casca da aplicação.
 * - Desktop (lg+): sidebar fixa + topbar + conteúdo scrollável.
 * - Mobile (<lg): sidebar vira drawer off-canvas acionado pelo topbar.
 */
export function AppShell() {
  const [navOpen, setNavOpen] = useState(false)

  // Fecha o drawer com Esc.
  useEffect(() => {
    if (!navOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNavOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navOpen])

  return (
    <div className="flex h-dvh overflow-hidden bg-canvas">
      {/* Sidebar fixa (desktop) */}
      <div className="hidden shrink-0 py-1 pl-1 lg:block">
        <Sidebar />
      </div>

      {/* Sidebar como drawer (mobile) */}
      <div
        className={cn('fixed inset-0 z-50 lg:hidden', !navOpen && 'pointer-events-none')}
        aria-hidden={!navOpen}
      >
        <div
          className={cn(
            'absolute inset-0 bg-ink-strong/40 transition-opacity duration-200',
            navOpen ? 'opacity-100' : 'opacity-0',
          )}
          onClick={() => setNavOpen(false)}
        />
        <div
          className={cn(
            'absolute inset-y-0 left-0 p-1 transition-transform duration-200 ease-out',
            navOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <Sidebar onNavigate={() => setNavOpen(false)} />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <Topbar onMenuClick={() => setNavOpen(true)} />
          <main className="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
