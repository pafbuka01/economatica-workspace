import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Ellipsis, Plus, Search, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { PageContainer } from '@/components/layout/PageContainer'
import {
  PLAN_LABEL,
  PLAN_SEATS,
  pendingInvites as initialInvites,
  teamMembers as initialMembers,
  type TeamRole,
  type TeamRow,
} from '@/data/team'

type Tab = 'members' | 'invites'

function RowAvatar({ row }: { row: TeamRow }) {
  if (row.avatar) {
    return <img src={row.avatar} alt="" className="size-10 shrink-0 rounded-full object-cover" />
  }
  const initials = row.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line bg-elevated text-xs font-semibold text-muted">
      {initials}
    </span>
  )
}

function RoleSelect({ role, onChange }: { role: TeamRole; onChange: (r: TeamRole) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-[6px] px-1.5 py-0.5 text-sm leading-6 text-ink transition-colors hover:bg-neutral-100"
      >
        {role}
        <ChevronDown
          className={cn('size-4 transition-transform duration-150', open && 'rotate-180')}
          aria-hidden
        />
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+4px)] z-30 w-[136px] animate-pop rounded-[8px] border border-line bg-surface p-1 shadow-card-xl">
          {(['Admin', 'Membro'] as TeamRole[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                onChange(r)
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center rounded-[6px] px-2.5 py-1.5 text-left text-sm transition-colors',
                r === role ? 'bg-sel-bg font-medium text-sel-text' : 'text-ink hover:bg-neutral-100',
              )}
            >
              {r}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function TeamTable({
  rows,
  onRoleChange,
}: {
  rows: TeamRow[]
  onRoleChange: (id: string, role: TeamRole) => void
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse">
        <thead>
          <tr className="border-b border-line">
            <th className="w-[405px] px-3 py-1 text-left text-[12.25px] font-semibold leading-5 text-muted">
              Usuário
            </th>
            <th className="px-3 py-1 text-left text-[12.25px] font-semibold leading-5 text-muted">
              E-mail corporativo
            </th>
            <th className="w-[134px] px-3 py-1 text-right text-[12.25px] font-semibold leading-5 text-muted">
              Função
            </th>
            <th className="w-[89px] px-3 py-1 text-right text-[12.25px] font-semibold leading-5 text-muted">
              Opções
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="h-[68px] border-b border-line">
              <td className="p-3">
                <div className="flex items-center gap-3">
                  <RowAvatar row={row} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="truncate text-base font-medium leading-6 text-ink">{row.name}</p>
                      {row.isYou && (
                        <span className="shrink-0 text-[12.25px] leading-5 text-brand-text">Você</span>
                      )}
                    </div>
                    {row.pending ? (
                      <p className="text-[12.25px] leading-5 text-[#0e8a8a] dark:text-cyan-400">
                        Convite pendente
                      </p>
                    ) : (
                      <p className="text-[12.25px] leading-5 text-muted">Desde {row.since}</p>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-3 text-sm leading-6 text-muted">{row.email}</td>
              <td className="px-3 text-right">
                {row.pending ? (
                  <span className="text-sm leading-6 text-ink">{row.role}</span>
                ) : (
                  <RoleSelect role={row.role} onChange={(r) => onRoleChange(row.id, r)} />
                )}
              </td>
              <td className="px-3">
                <button
                  type="button"
                  aria-label={`Opções de ${row.name}`}
                  className="ml-auto flex size-6 items-center justify-center rounded-[6px] text-ink transition-colors hover:bg-neutral-100"
                >
                  <Ellipsis className="size-4" aria-hidden />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <p className="px-3 py-8 text-center text-sm leading-5 text-muted">Nenhum resultado encontrado.</p>
      )}
    </div>
  )
}

function InviteModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (locals: string[]) => void
}) {
  const [emails, setEmails] = useState([''])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function send() {
    // Aceita tanto "ana.souza" quanto o e-mail completo colado
    const locals = emails.map((e) => e.trim().replace(/@.*$/, '')).filter(Boolean)
    if (locals.length === 0) return
    onSubmit(locals)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-strong/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Convidar novo membro"
        className="relative flex w-full max-w-[600px] animate-pop flex-col gap-6 rounded-[6px] border border-line bg-canvas p-6 shadow-card-xl dark:bg-surface"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-[6px] text-muted transition-colors hover:text-ink"
        >
          <X className="size-4" aria-hidden />
        </button>

        <div className="flex flex-col gap-2 pr-4">
          <h2 className="text-[27px] font-bold leading-8 text-ink">Convidar novo membro</h2>
          <p className="text-sm leading-5 text-muted">
            Envie um convite por e-mail para adicionar uma nova pessoa ao seu workspace.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold leading-4 text-[#4e575b] dark:text-nav">E-mail</label>
            {emails.map((value, i) => (
              <div
                key={i}
                className="flex h-10 items-center overflow-hidden rounded-[6px] border border-line bg-elevated transition-colors focus-within:border-neutral-400"
              >
                <input
                  autoFocus={i === emails.length - 1}
                  type="text"
                  value={value}
                  onChange={(e) =>
                    setEmails((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))
                  }
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  placeholder="Digite o início do e-mail..."
                  className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm leading-5 text-ink outline-none placeholder:text-subdued"
                />
                <span className="shrink-0 px-4 text-sm leading-5 text-muted">@economatica.com.br</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setEmails((prev) => [...prev, ''])}
            className="inline-flex h-10 items-center gap-2 self-start rounded-[6px] bg-elevated px-3 text-sm font-medium text-ink transition duration-150 hover:bg-neutral-200 active:scale-[0.98]"
          >
            <Plus className="size-4" aria-hidden />
            Adicionar outro membro
          </button>
        </div>

        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-2 text-sm font-medium text-muted transition-colors hover:text-ink"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={send}
            className="h-10 rounded-[6px] bg-accent px-3 text-sm font-medium text-on-accent transition duration-150 hover:bg-accent/85 active:scale-[0.98]"
          >
            Enviar convite
          </button>
        </div>
      </div>
    </div>
  )
}

export function UsersPage() {
  const [tab, setTab] = useState<Tab>('members')
  const [query, setQuery] = useState('')
  const [members, setMembers] = useState(initialMembers)
  const [invites, setInvites] = useState(initialInvites)
  const [inviteOpen, setInviteOpen] = useState(false)

  const tabs: { id: Tab; label: string }[] = [
    { id: 'members', label: 'Membros do time' },
    { id: 'invites', label: 'Convites pendentes' },
  ]

  const rows = tab === 'members' ? members : invites
  const q = query.trim().toLowerCase()
  const filtered = q ? rows.filter((r) => `${r.name} ${r.email}`.toLowerCase().includes(q)) : rows

  function handleRoleChange(id: string, role: TeamRole) {
    const update = (list: TeamRow[]) => list.map((r) => (r.id === id ? { ...r, role } : r))
    setMembers(update)
    setInvites(update)
  }

  function handleInvite(locals: string[]) {
    const newInvites: TeamRow[] = locals.map((local, i) => ({
      id: `invite-${Date.now()}-${i}`,
      // Nome provisório derivado do e-mail ("ana.souza" → "Ana Souza")
      name: local
        .split(/[._-]+/)
        .filter(Boolean)
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(' '),
      email: `${local}@economatica.com.br`,
      role: 'Membro',
      pending: true,
    }))
    setInvites((prev) => [...prev, ...newInvites])
    setInviteOpen(false)
    setTab('invites')
  }

  return (
    <PageContainer className="flex flex-col gap-6 py-6">
      <div className="flex flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h1 className="text-[22px] font-bold leading-6 text-ink">Usuários</h1>
          <p className="text-sm leading-5 text-muted">
            {PLAN_LABEL} ({members.length} de {PLAN_SEATS} membros)
          </p>
        </header>

        <div className="flex gap-4 overflow-x-auto border-b border-line">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'shrink-0 border-b px-1 pb-2 pt-3 text-sm font-medium transition-colors',
                tab === t.id
                  ? 'border-brand-border text-brand-text'
                  : 'border-transparent text-neutral-400 hover:text-muted',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex h-10 w-full max-w-[344px] items-center gap-3 rounded-[6px] border border-line bg-elevated px-3 transition-colors focus-within:border-neutral-400">
          <Search className="size-4 shrink-0 text-muted" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar membro"
            className="h-full min-w-0 flex-1 bg-transparent text-sm leading-5 text-ink outline-none placeholder:text-muted"
          />
        </div>
        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[6px] bg-accent px-3 text-sm font-medium text-on-accent transition duration-150 hover:bg-accent/85 active:scale-[0.98]"
        >
          <Plus className="size-4" aria-hidden />
          Convidar membro
        </button>
      </div>

      {/* key por aba: conteúdo entra com um fade curto ao alternar */}
      <div key={tab} className="animate-page">
        <TeamTable rows={filtered} onRoleChange={handleRoleChange} />
      </div>

      {inviteOpen && <InviteModal onClose={() => setInviteOpen(false)} onSubmit={handleInvite} />}
    </PageContainer>
  )
}
