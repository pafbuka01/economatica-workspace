import { useEffect, useState } from 'react'
import { ChevronRight, Sun, Moon, Leaf, LogOut } from 'lucide-react'
import { cn } from '@/lib/cn'
import avatarPhoto from '@/assets/avatar.png'
import faviconBadge from '@/assets/favicon-badge.png'

function Avatar({ size = 40 }: { size?: number }) {
  return (
    <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      <img
        src={avatarPhoto}
        alt=""
        className="size-full rounded-full object-cover"
      />
      <span className="absolute -bottom-px -right-px flex size-4 items-center justify-center overflow-hidden rounded-[4px] bg-white">
        <img src={faviconBadge} alt="" className="size-4" />
      </span>
    </span>
  )
}

type Theme = 'light' | 'sand' | 'dark'

function applyTheme(value: Theme) {
  document.documentElement.classList.toggle('dark', value === 'dark')
  document.documentElement.classList.toggle('sand', value === 'sand')
  try {
    localStorage.setItem('theme', value)
  } catch {
    /* armazenamento indisponível (modo privado etc.) — só não persiste */
  }
}

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    const cl = document.documentElement.classList
    return cl.contains('dark') ? 'dark' : cl.contains('sand') ? 'sand' : 'light'
  })
  const select = (value: Theme) => {
    setTheme(value)
    applyTheme(value)
  }
  const option = (value: Theme, Icon: typeof Sun, label: string) => (
    <button
      type="button"
      aria-label={label}
      aria-pressed={theme === value}
      onClick={() => select(value)}
      className={cn(
        'flex h-7 items-center justify-center rounded-full px-2 transition duration-150',
        theme === value ? 'bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.1)]' : 'hover:bg-surface/50',
      )}
    >
      <Icon className="size-4 text-ink" aria-hidden />
    </button>
  )
  return (
    <div className="flex h-8 shrink-0 items-center rounded-full bg-elevated p-0.5">
      {option('light', Sun, 'Tema claro')}
      {option('sand', Leaf, 'Tema areia (experimental)')}
      {option('dark', Moon, 'Tema escuro')}
    </div>
  )
}

function MenuRow({ label, onClick, danger }: { label: string; onClick?: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-14 w-full items-center justify-between gap-2 border-b border-line px-4 text-left transition-colors last:border-b-0 hover:bg-neutral-100"
    >
      <span className="text-sm font-semibold leading-6 text-ink">{label}</span>
      {danger ? (
        <LogOut className="size-5 text-danger-text" aria-hidden />
      ) : (
        <ChevronRight className="size-5 text-ink" aria-hidden />
      )}
    </button>
  )
}

function Contact({
  initials,
  color,
  name,
  role,
  email,
}: {
  initials: string
  color: string
  name: string
  role: string
  email: string
}) {
  return (
    <div className="flex w-full items-start gap-3 py-2">
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
        style={{ backgroundColor: color }}
      >
        {initials}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-sm font-semibold leading-5 text-ink">{name}</span>
        <span className="truncate text-xs leading-4 text-muted">{role}</span>
        <a href={`mailto:${email}`} className="truncate text-xs leading-4 text-cyan-500 hover:underline">
          {email}
        </a>
      </span>
    </div>
  )
}

function SecondaryButton({ children }: { children: string }) {
  return (
    <button
      type="button"
      className="inline-flex h-10 w-full items-center justify-center rounded-[6px] bg-neutral-200 px-3 text-sm font-medium text-ink transition duration-150 hover:bg-neutral-300 active:scale-[0.98]"
    >
      {children}
    </button>
  )
}

function Dropdown() {
  return (
    <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[370px] max-w-[calc(100vw-32px)] animate-pop overflow-hidden rounded-[12px] border border-line bg-surface shadow-[0px_2.7px_9px_rgba(0,0,0,0.13),0px_9.4px_24px_rgba(0,0,0,0.09),0px_21.8px_43px_rgba(0,0,0,0.08)]">
      <div className="max-h-[calc(100dvh-96px)] overflow-y-auto [scrollbar-width:thin]">
        {/* Usuário */}
        <div className="flex items-center gap-3 border-b border-line p-4">
          <Avatar />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-5 text-ink">Gustavo Figueira</p>
            <p className="truncate text-sm leading-5 text-muted">Economatica</p>
          </div>
        </div>

        {/* Tema */}
        <div className="flex h-14 items-center justify-between gap-2 border-b border-line px-4">
          <span className="text-sm font-semibold leading-6 text-ink">Tema</span>
          <ThemeToggle />
        </div>

        <MenuRow label="Gerenciar usuários" />
        <MenuRow label="Segurança e login" />

        {/* Produtos contratados */}
        <div className="flex flex-col gap-3 border-b border-line p-5">
          <p className="text-xs font-medium uppercase leading-4 text-ink">Produtos contratados</p>
          <div className="flex flex-col gap-1">
            {[
              ['Contrato', 'Trial de 7 dias'],
              ['Kento', 'Trial - Kento Pro'],
              ['Expiração', '14/07/2026'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between py-1">
                <span className="text-sm leading-5 text-muted">{label}</span>
                <span className="text-sm font-medium leading-[21px] text-ink">{value}</span>
              </div>
            ))}
          </div>
          <SecondaryButton>Contratar plano</SecondaryButton>
        </div>

        {/* Atendimento */}
        <div className="flex flex-col gap-3 border-b border-line p-5">
          <p className="text-xs font-medium uppercase leading-4 text-ink">Atendimento</p>
          <div className="flex flex-col gap-1">
            <Contact
              initials="SM"
              color="#17b26a"
              name="Simone Moraes"
              role="Comercial responsável"
              email="simone@economatica.com.br"
            />
            <Contact
              initials="Td"
              color="#13a8a8"
              name="Tatiane de Jesus Oliveira"
              role="Especialista da conta"
              email="tatiane.jesus@economatica.com.br"
            />
          </div>
          <SecondaryButton>Agendar conversa</SecondaryButton>
        </div>

        <MenuRow label="Sair" danger />
      </div>
    </div>
  )
}

/** Avatar do header com o dropdown de conta do usuário. */
export function UserMenu() {
  const [open, setOpen] = useState(false)

  // Fecha com Esc.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Conta"
        aria-expanded={open}
        className="block transition duration-150 active:scale-95"
      >
        <Avatar />
      </button>

      {open && (
        <>
          {/* backdrop invisível: fecha ao clicar fora */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <Dropdown />
        </>
      )}
    </div>
  )
}
