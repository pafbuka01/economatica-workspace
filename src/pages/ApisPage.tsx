import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { PageContainer } from '@/components/layout/PageContainer'
import { TutorialCard } from '@/features/terminal/TutorialCard'
import { ApiCard } from '@/features/apis/ApiCard'
import { ApiDetail } from '@/features/apis/ApiDetail'
import { apiServices, apiTutorials } from '@/data/apis'
import { ApisIcon } from '@/lib/icons'
import bannerImg from '@/assets/apis-banner.png'

const tabs = [{ id: 'overview', label: 'Visão geral' }, ...apiServices.map((a) => ({ id: a.id, label: a.name }))]

function Banner() {
  return (
    <section className="flex flex-col gap-4">
      <img
        src={bannerImg}
        alt=""
        className="aspect-[1106/123] w-full rounded-[16px] object-cover"
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3 sm:items-center">
          <div className="flex size-[55px] shrink-0 items-center justify-center rounded-[12px] bg-brand">
            <ApisIcon className="h-6 w-8 text-white" aria-hidden />
          </div>
          <div className="min-w-0">
            <h1 className="text-[22px] font-bold leading-6 text-ink">APIs Economatica</h1>
            <p className="mt-0.5 text-sm leading-6 text-muted">
              Integre a base da Economatica em plataformas, modelos quantitativos,
              aplicações corporativas e agentes de IA.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="group inline-flex h-10 min-w-[112px] shrink-0 items-center justify-center gap-2 self-start rounded-[6px] bg-accent px-3 text-sm font-medium text-ink transition duration-150 hover:bg-accent/85 active:scale-[0.98] sm:self-auto"
        >
          Documentação
          <ArrowUpRight
            className="size-4 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden
          />
        </button>
      </div>
    </section>
  )
}

export function ApisPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const activeApi = apiServices.find((a) => a.id === activeTab)

  return (
    <PageContainer className="flex flex-col gap-10 py-6">
      <div className="flex flex-col gap-4">
        <Banner />

        <div className="flex gap-4 overflow-x-auto border-b border-line">
          {tabs.map((t) => {
            const active = activeTab === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  'shrink-0 border-b px-1 pb-2 pt-3 text-sm font-medium transition-colors',
                  active ? 'border-brand text-brand' : 'border-transparent text-neutral-400 hover:text-muted',
                )}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* key por aba: conteúdo entra com um fade curto ao alternar */}
      <div key={activeTab} className="flex animate-page flex-col gap-10">
        {activeApi ? (
          <ApiDetail api={activeApi} />
        ) : (
          <>
            <section className="flex flex-col gap-4">
              <h2 className="text-base font-bold leading-6 text-ink">APIs disponíveis</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {apiServices.map((api) => (
                  <ApiCard key={api.id} api={api} onDetails={setActiveTab} />
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-base font-bold leading-6 text-ink">Tutoriais</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {apiTutorials.map((t, i) => (
                  <TutorialCard key={`${t.title}-${i}`} tutorial={t} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </PageContainer>
  )
}
