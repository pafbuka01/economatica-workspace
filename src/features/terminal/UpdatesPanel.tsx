import { terminalUpdates } from '@/data/terminal'
import { ClockIcon } from '@/lib/icons'

export function UpdatesPanel() {
  return (
    <aside className="flex flex-col gap-4">
      <h2 className="text-base font-bold leading-6 text-ink">Últimos updates</h2>
      <div className="flex flex-col gap-4">
        {terminalUpdates.map((u) => (
          <article key={u.title} className="flex flex-col gap-0.5">
            <h3 className="text-sm font-medium leading-6 text-ink">{u.title}</h3>
            <div className="flex items-center gap-1">
              {u.isNew && (
                <span className="text-[12.25px] font-medium leading-5 text-cyan-500">
                  Novo
                </span>
              )}
              <ClockIcon className="size-4 shrink-0 text-muted" aria-hidden />
              <span className="text-[12.25px] leading-5 text-muted">{u.date}</span>
            </div>
            <p className="text-sm leading-5 text-muted">{u.description}</p>
            {u.image && (
              <img
                src={u.image}
                alt=""
                className="mt-1 h-[78px] w-full rounded-[6px] border border-neutral-300 object-cover"
              />
            )}
          </article>
        ))}
      </div>
    </aside>
  )
}
