import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import {
  qualificationAccessModels,
  qualificationBases,
  qualificationChannels,
  qualificationCommercialModels,
  qualificationCompanyRanges,
  qualificationCountries,
  qualificationDataMarkets,
  qualificationDeliverySurfaces,
  qualificationEmployeeRanges,
  qualificationExportNeeds,
  qualificationObjectives,
  qualificationPayers,
  qualificationRedistribution,
  qualificationRoles,
  qualificationSegments,
  qualificationStates,
  qualificationUsageTypes,
  qualificationUserRanges,
  type CatalogOption,
  type QualificationUsageType,
} from '@/features/onboarding/catalogs'
import { completeOnboarding, defaultDeclaredProfile, type DeclaredProfile } from '@/features/onboarding/profile-store'
import { track } from '@/lib/telemetry'

function Field({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <label className={cn('flex min-w-0 flex-col gap-1.5', wide && 'sm:col-span-2')}>
      <span className="text-xs font-bold leading-4 text-muted">{label}</span>
      {children}
    </label>
  )
}

const selectClasses =
  'h-10 w-full rounded-[6px] border border-line bg-surface px-3 text-sm text-ink transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent'

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: CatalogOption[] }) {
  return (
    <select className={selectClasses} value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((option) => (
        <option key={option.code} value={option.code}>{option.label}</option>
      ))}
    </select>
  )
}

function toggle(list: string[], item: string) {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item]
}

function ChipGroup({ label, options, selected, onToggle }: { label: string; options: CatalogOption[]; selected: string[]; onToggle: (item: string) => void }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 sm:col-span-2">
      <span className="text-xs font-bold leading-4 text-muted">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const active = selected.includes(option.code)
          return (
            <button
              key={option.code}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(option.code)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors',
                active
                  ? 'border-sel-border bg-sel-bg text-sel-text'
                  : 'border-line bg-surface text-muted hover:border-neutral-300 hover:text-ink',
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Block({ step, title, description, children }: { step: number; title: string; description: string; children: ReactNode }) {
  return (
    <section className="animate-rise rounded-[8px] border border-line bg-surface p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-sel-bg text-xs font-bold text-sel-text">{step}</span>
        <div>
          <h2 className="text-base font-bold leading-6 text-ink">{title}</h2>
          <p className="mt-0.5 text-sm leading-5 text-muted">{description}</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </section>
  )
}

/**
 * Primeiro acesso — qualificação estruturada com os mesmos campos e a mesma
 * lógica do protótipo. Todo acesso ao Workspace passa por aqui (mock, sem
 * persistência entre visitas); "Avançar" leva para a Home.
 */
export function OnboardingPage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<DeclaredProfile>({ ...defaultDeclaredProfile })

  const set = <K extends keyof DeclaredProfile>(key: K, value: DeclaredProfile[K]) =>
    setProfile((current) => ({ ...current, [key]: value }))

  const setUsageType = (usageType: QualificationUsageType) =>
    setProfile((current) => ({
      ...current,
      usageType,
      deliverySurfaces: usageType === 'uso-interno' ? ['workspace-interno', 'planilha', 'dashboard'] : ['area-logada', 'dashboard', 'chatbot'],
      redistribution: usageType === 'uso-interno' ? 'nao' : 'sim-derivados',
      exportNeeds: usageType === 'uso-interno' ? 'csv-excel' : 'api',
    }))

  const isBusinessProject = profile.usageType !== 'uso-interno'
  const needsClientCompanyScale = profile.usageType === 'b2b' || profile.usageType === 'b2b2c'
  const needsEndUserScale = profile.usageType === 'b2c' || profile.usageType === 'b2b2c'
  const lastStep = profile.usageType === 'uso-interno' ? 3 : 5

  const advance = () => {
    completeOnboarding(profile)
    track('onboarding_completed', { role: profile.role, usageType: profile.usageType })
    navigate('/', { replace: true })
  }

  return (
    <main className="min-h-full bg-canvas">
      <div className="mx-auto flex w-full max-w-[880px] animate-page flex-col gap-5 px-4 py-10 sm:px-6">
        <header>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-nav-label">Primeiro acesso</p>
          <h1 className="mt-1 text-[22px] font-bold leading-7 text-ink">Configure seu perfil de acesso.</h1>
          <p className="mt-1 text-sm leading-6 text-muted">
            Suas respostas personalizam recomendações da Biblioteca e a rota de ativação do trial.
          </p>
        </header>

        <Block step={1} title="Organização" description="Identifica segmento, localização e responsável pelo primeiro acesso.">
          <Field label="Cargo">
            <Select value={profile.role} onChange={(v) => set('role', v)} options={qualificationRoles} />
          </Field>
          <Field label="Tipo de instituição">
            <Select value={profile.institution} onChange={(v) => set('institution', v)} options={qualificationSegments} />
          </Field>
          <Field label="País da organização">
            <Select value={profile.country} onChange={(v) => set('country', v)} options={qualificationCountries} />
          </Field>
          <Field label="Estado / UF">
            <Select value={profile.state} onChange={(v) => set('state', v)} options={qualificationStates} />
          </Field>
          <Field label="Nº de funcionários" wide>
            <Select value={profile.employees} onChange={(v) => set('employees', v)} options={qualificationEmployeeRanges} />
          </Field>
        </Block>

        <Block step={2} title="Tipo de uso" description="Campo mais importante para pricing, risco de redistribuição e rota comercial.">
          <div className="grid grid-cols-1 gap-2 sm:col-span-2 sm:grid-cols-2 lg:grid-cols-4">
            {qualificationUsageTypes.map((item) => {
              const active = profile.usageType === item.code
              return (
                <button
                  key={item.code}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setUsageType(item.code)}
                  className={cn(
                    'flex h-full flex-col gap-1 rounded-[8px] border p-3 text-left transition-colors',
                    active ? 'border-sel-border bg-sel-bg' : 'border-line bg-elevated hover:border-neutral-300',
                  )}
                >
                  <span className={cn('text-sm font-bold leading-5', active ? 'text-sel-text' : 'text-ink')}>{item.label}</span>
                  <span className="text-[12.25px] leading-4 text-muted">{item.description}</span>
                </button>
              )
            })}
          </div>
        </Block>

        {isBusinessProject && (
          <Block step={3} title="Escala do projeto" description="Para projetos B2B, B2C e B2B2C, dimensiona alcance, pricing, suporte e risco de redistribuição.">
            {needsClientCompanyScale && (
              <>
                <Field label="Empresas clientes no mês 1">
                  <Select value={profile.clientCompaniesMonth1} onChange={(v) => set('clientCompaniesMonth1', v)} options={qualificationCompanyRanges} />
                </Field>
                <Field label="Empresas clientes em 12 meses">
                  <Select value={profile.clientCompaniesYear1} onChange={(v) => set('clientCompaniesYear1', v)} options={qualificationCompanyRanges} />
                </Field>
              </>
            )}
            {needsEndUserScale && (
              <>
                <Field label="Usuários finais no mês 1">
                  <Select value={profile.endUsersMonth1} onChange={(v) => set('endUsersMonth1', v)} options={qualificationUserRanges} />
                </Field>
                <Field label="Usuários finais em 12 meses">
                  <Select value={profile.endUsersYear1} onChange={(v) => set('endUsersYear1', v)} options={qualificationUserRanges} />
                </Field>
              </>
            )}
          </Block>
        )}

        {isBusinessProject && (
          <Block step={4} title="Modelo do projeto" description="Define distribuição, monetização, superfícies e risco de egresso de dados.">
            <Field label="Modelo de acesso">
              <Select value={profile.accessModel} onChange={(v) => set('accessModel', v)} options={qualificationAccessModels} />
            </Field>
            <Field label="Modelo comercial">
              <Select value={profile.commercialModel} onChange={(v) => set('commercialModel', v)} options={qualificationCommercialModels} />
            </Field>
            <Field label="Quem paga pelo acesso" wide>
              <Select value={profile.payer} onChange={(v) => set('payer', v)} options={qualificationPayers} />
            </Field>
            <Field label="Descreva brevemente o projeto" wide>
              <textarea
                className={cn(selectClasses, 'h-auto min-h-20 py-2.5 leading-5')}
                value={profile.projectDescription}
                onChange={(e) => set('projectDescription', e.target.value)}
                placeholder="Ex: queremos usar notícias e fundamentos para alimentar uma área logada de análise para clientes institucionais."
              />
            </Field>
          </Block>
        )}

        <Block step={lastStep} title="Dados, canais e saída" description="Catálogos usados para entitlement, roteamento técnico e recomendações por perfil.">
          <ChipGroup label="Superfícies de entrega" options={qualificationDeliverySurfaces} selected={profile.deliverySurfaces} onToggle={(item) => set('deliverySurfaces', toggle(profile.deliverySurfaces, item))} />
          <Field label="Redistribuição de dados">
            <Select value={profile.redistribution} onChange={(v) => set('redistribution', v)} options={qualificationRedistribution} />
          </Field>
          <Field label="Exportação prevista">
            <Select value={profile.exportNeeds} onChange={(v) => set('exportNeeds', v)} options={qualificationExportNeeds} />
          </Field>
          <ChipGroup label="Bases de dados desejadas" options={qualificationBases} selected={profile.bases} onToggle={(item) => set('bases', toggle(profile.bases, item))} />
          <ChipGroup label="Países/mercados de dados desejados" options={qualificationDataMarkets} selected={profile.markets} onToggle={(item) => set('markets', toggle(profile.markets, item))} />
          <ChipGroup label="Canais técnicos" options={qualificationChannels} selected={profile.channels} onToggle={(item) => set('channels', toggle(profile.channels, item))} />
          <ChipGroup label="Objetivo analítico" options={qualificationObjectives} selected={profile.objectives} onToggle={(item) => set('objectives', toggle(profile.objectives, item))} />
        </Block>

        <footer className="flex flex-col items-start justify-between gap-3 pb-6 sm:flex-row sm:items-center">
          <p className="text-[12.25px] leading-4 text-muted">
            Dados demonstrativos. No produto real, este payload alimenta CRM, PQL, trial, entitlement e roteamento comercial.
          </p>
          <Button size="md" withArrow onClick={advance} className="min-w-[132px]">
            Avançar
          </Button>
        </footer>
      </div>
    </main>
  )
}
