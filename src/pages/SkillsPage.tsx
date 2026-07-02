import { useState } from 'react'
import { cn } from '@/lib/cn'
import { PageContainer } from '@/components/layout/PageContainer'
import { CarouselSection } from '@/features/library/CarouselSection'
import { PromptCard } from '@/features/library/PromptCard'
import { SkillCard } from '@/features/library/SkillCard'
import { ArtifactCard } from '@/features/library/ArtifactCard'
import { libraryPrompts, librarySkills, libraryArtifacts } from '@/data/library'

const tabs = ['Pra você', 'Prompts', 'Skills', 'Artefatos', 'Ferramentas']

/** Largura fixa dos cards nos carrosséis (comp: 360px). */
const CARD = 'w-[360px] shrink-0 snap-start'

function ForYou() {
  return (
    <>
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
          <p className="text-sm leading-6 text-muted">
            Nenhuma ferramenta disponível ainda.
          </p>
        )}
      </div>
    </PageContainer>
  )
}
