import { ArrowUpRight } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { TutorialCard } from '@/features/terminal/TutorialCard'
import { UpdatesPanel } from '@/features/terminal/UpdatesPanel'
import { terminalStats, tutorials } from '@/data/terminal'
import { TeMarkIcon } from '@/lib/icons'
import bannerImg from '@/assets/terminal-banner.png'

function Banner() {
  return (
    <section className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-[16px]">
        <img
          src={bannerImg}
          alt="Interface do Terminal Economatica"
          className="mx-auto aspect-[778/106] w-full max-w-[778px] rounded-[12px] object-cover object-top sm:mt-[17px]"
        />
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3 sm:items-center">
          <div className="flex size-[55px] shrink-0 items-center justify-center rounded-[12px] bg-accent">
            <TeMarkIcon className="h-[22px] w-[30px] text-ink" aria-hidden />
          </div>
          <div className="min-w-0">
            <h1 className="text-[22px] font-bold leading-6 text-ink">Terminal</h1>
            <p className="mt-0.5 text-sm leading-6 text-muted">
              Camada mais recente de consumo e navegação da base Economatica, com recursos
              de IA incorporados ao fluxo de análise.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex h-10 min-w-[112px] shrink-0 items-center justify-center gap-2 self-start rounded-[6px] bg-accent px-3 text-sm font-medium text-ink transition-colors hover:bg-accent/85 sm:self-auto"
        >
          Acessar
          <ArrowUpRight className="size-4" aria-hidden />
        </button>
      </div>
    </section>
  )
}

function UsageStats() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-base font-bold leading-6 text-ink">Uso geral</h2>
      <div className="flex flex-col divide-y divide-line rounded-[8px] border border-line bg-canvas sm:flex-row sm:divide-x sm:divide-y-0">
        {terminalStats.map((s) => (
          <div key={s.label} className="flex min-w-0 flex-1 flex-col gap-3 p-4">
            <p className="text-sm leading-5 text-muted">{s.label}</p>
            <p className="flex items-baseline gap-2">
              <span className="text-[22px] font-bold leading-6 text-ink">{s.value}</span>
              {s.detail && (
                <span className="text-[12.25px] leading-5 text-muted">{s.detail}</span>
              )}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function TerminalPage() {
  return (
    <PageContainer className="flex flex-col gap-10 py-6">
      <Banner />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_264px] lg:gap-6">
        <div className="flex min-w-0 flex-col gap-10">
          <UsageStats />

          <section className="flex flex-col gap-4">
            <h2 className="text-base font-bold leading-6 text-ink">Tutoriais</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tutorials.map((t) => (
                <TutorialCard key={t.title} tutorial={t} />
              ))}
            </div>
          </section>
        </div>

        <UpdatesPanel />
      </div>
    </PageContainer>
  )
}
