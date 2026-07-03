import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { PageContainer } from '@/components/layout/PageContainer'
import { CarouselSection } from '@/features/library/CarouselSection'
import { PromptCard } from '@/features/library/PromptCard'
import { SkillCard } from '@/features/library/SkillCard'
import { ArtifactCard } from '@/features/library/ArtifactCard'
import { RecommendationCard } from '@/features/library/RecommendationCard'
import { ToolCard } from '@/features/library/ToolCard'
import { useLibraryRecommendations } from '@/features/library/useLibraryRecommendations'
import { libraryPrompts, librarySkills, libraryArtifacts, libraryTools } from '@/data/library'
import { labelFor, qualificationChannels, qualificationRoles } from '@/features/onboarding/catalogs'
import { getDeclaredProfile, preferredChannelOf } from '@/features/onboarding/profile-store'
import { track } from '@/lib/telemetry'

const tabs = ['Pra você', 'Prompts', 'Skills', 'Artefatos', 'Ferramentas']

/** Largura fixa dos cards nos carrosséis (comp: 360px). */
const CARD = 'w-[360px] shrink-0 snap-start'

const filterSelectClasses =
  'h-8 rounded-[6px] border border-line bg-surface px-2 text-[12.5px] font-medium text-ink transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent'

/**
 * Recomendações filtradas pelo perfil declarado no primeiro acesso.
 * O filtro consulta o BFF (userbffapi v4) e cai no motor local com o
 * mesmo catálogo quando o BFF não está disponível.
 */
function RecommendedForProfile() {
  // O motor de recomendação (BFF e fallback local) casa perfis por LABEL;
  // o perfil declarado guarda CÓDIGOS canônicos — mapeia na entrada.
  const declared = getDeclaredProfile()
  const [role, setRole] = useState(labelFor(qualificationRoles, declared.role))
  const [channel, setChannel] = useState(labelFor(qualificationChannels, preferredChannelOf(declared)))
  useEffect(() => {
    track('library_open', { role, channel })
    // Só na abertura: mudança de filtro tem evento próprio abaixo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const { data, loading, error, recordEvent } = useLibraryRecommendations({
    role,
    preferredChannel: channel,
    isCurrentCustomer: true,
  })

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-bold leading-6 text-ink">Recomendados para seu perfil</h2>
          <p className="mt-0.5 text-[12px] leading-4 text-subdued">
            {loading ? 'Atualizando recomendações…' : `Fonte: ${data.source === 'bff' ? 'BFF' : 'local'} · ${data.recommendationVersion}`}
            {error ? ' · fallback local ativo' : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 text-[12px] font-medium text-muted">
            Perfil
            <select className={filterSelectClasses} value={role} onChange={(e) => { setRole(e.target.value); track('library_filter_profile', { role: e.target.value, channel }) }}>
              {qualificationRoles.map((r) => (
                <option key={r.code} value={r.label}>{r.label}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-1.5 text-[12px] font-medium text-muted">
            Canal
            <select className={filterSelectClasses} value={channel} onChange={(e) => { setChannel(e.target.value); track('library_filter_profile', { role, channel: e.target.value }) }}>
              {qualificationChannels.map((c) => (
                <option key={c.code} value={c.label}>{c.label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="-mr-4 -mt-1 flex snap-x gap-3 overflow-x-auto pb-1 pr-4 pt-1 sm:-mr-10 sm:pr-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {data.recommendedObjects.map((rec) => (
          <div key={rec.id} className={CARD}>
            <RecommendationCard
              recommendation={rec}
              onOpen={(r) => void recordEvent({ objectId: r.id, channel: r.channels[0] ?? 'Biblioteca', eventType: 'recommendation_clicked' })}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

function ForYou() {
  return (
    <>
      <RecommendedForProfile />

      <CarouselSection title="Prompts mais usados">
        {libraryPrompts.map((p) => (
          <div key={p.title} className={CARD}>
            <PromptCard prompt={p} />
          </div>
        ))}
      </CarouselSection>

      <CarouselSection title="Skills para seu perfil">
        {librarySkills.map((s) => (
          <div key={s.name} className={CARD}>
            <SkillCard skill={s} />
          </div>
        ))}
      </CarouselSection>

      <CarouselSection title="Artefatos em alta">
        {libraryArtifacts.map((a) => (
          <div key={a.title} className={CARD}>
            <ArtifactCard artifact={a} />
          </div>
        ))}
      </CarouselSection>
    </>
  )
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
}

export function SkillsPage() {
  const [activeTab, setActiveTab] = useState(tabs[0])

  return (
    <PageContainer className="flex flex-col gap-10 py-6">
      <div className="flex flex-col gap-4">
        <header>
          <h1 className="text-[22px] font-bold leading-6 text-ink">Skills e Prompts</h1>
          <p className="mt-1 text-sm leading-6 text-muted">
            A Biblioteca organiza prompts, tutoriais, playbooks e artefatos de acordo com
            seu perfil, canal escolhido e produto que você quer ativar.
          </p>
        </header>

        <div className="flex gap-4 overflow-x-auto border-b border-line">
          {tabs.map((t) => {
            const active = activeTab === t
            return (
              <button
                key={t}
                type="button"
                onClick={() => setActiveTab(t)}
                className={cn(
                  'shrink-0 border-b px-1 pb-2 pt-3 text-sm font-medium transition-colors',
                  active ? 'border-brand-border text-brand-text' : 'border-transparent text-neutral-400 hover:text-muted',
                )}
              >
                {t}
              </button>
            )
          })}
        </div>
      </div>

      {/* key por aba: conteúdo entra com um fade curto ao alternar */}
      <div key={activeTab} className="flex animate-page flex-col gap-10">
        {activeTab === 'Pra você' && <ForYou />}
        {activeTab === 'Prompts' && (
          <Grid>
            {libraryPrompts.map((p) => (
              <PromptCard key={p.title} prompt={p} />
            ))}
          </Grid>
        )}
        {activeTab === 'Skills' && (
          <Grid>
            {librarySkills.map((s) => (
              <SkillCard key={s.name} skill={s} />
            ))}
          </Grid>
        )}
        {activeTab === 'Artefatos' && (
          <Grid>
            {libraryArtifacts.map((a) => (
              <ArtifactCard key={a.title} artifact={a} />
            ))}
          </Grid>
        )}
        {activeTab === 'Ferramentas' && (
          <Grid>
            {libraryTools.map((t) => (
              <ToolCard key={t.name} tool={t} />
            ))}
          </Grid>
        )}
      </div>
    </PageContainer>
  )
}
