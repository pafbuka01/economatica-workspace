import { useState } from 'react'
import { Settings, ArrowUpRight, ArrowUp } from 'lucide-react'
import { cn } from '@/lib/cn'
import { TabGridIcon } from '@/lib/icons'
import { connectors, usageMetrics, type Connector, type Metric } from '@/data/mcp'
import { McpLibrary } from '@/features/kento-mcp/McpLibrary'
import { ConnectSteps } from '@/features/kento-mcp/ConnectSteps'
import { PageContainer } from '@/components/layout/PageContainer'

const zeroMetrics: Metric[] = usageMetrics.map((m) => ({ label: m.label, value: '0' }))

function Status({ connected }: { connected: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span className={cn('size-2 shrink-0 rounded-full', connected ? 'bg-success-500' : 'bg-neutral-400')} />
      <span className={cn('text-xs font-medium leading-4', connected ? 'text-positive-text' : 'text-muted')}>
        {connected ? 'Conectado' : 'Sem conexão'}
      </span>
    </span>
  )
}

function MetricsRow({ metrics, className }: { metrics: Metric[]; className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col divide-y divide-line rounded-[8px] border border-line sm:flex-row sm:divide-x sm:divide-y-0',
        className,
      )}
    >
      {metrics.map((m, i) => (
        <div key={i} className="flex min-w-0 flex-1 flex-col gap-3 p-4">
          <p className="text-sm leading-5 text-muted">{m.label}</p>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[22px] font-bold leading-6 text-ink">{m.value}</p>
            {m.trend && (
              <span className="flex items-center gap-1 rounded-full bg-badge-pos-bg px-1.5 py-1 text-xs font-medium leading-4 text-badge-pos-text">
                {m.trend !== 'Excelente' && <ArrowUp className="size-3" aria-hidden />}
                {m.trend}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function ConnectorView({ connector }: { connector: Connector }) {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4 rounded-[8px] border border-line bg-elevated p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <img src={connector.logo} alt="" className={cn('size-10 shrink-0', connector.id === 'chatgpt' && 'dark:invert')} />
            <div className="min-w-0">
              <h2 className="text-[22px] font-bold leading-6 text-ink">{connector.name}</h2>
              <div className="mt-1">
                <Status connected={connector.connected} />
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[6px] bg-neutral-200 px-3 text-sm font-medium text-ink transition duration-150 hover:bg-neutral-300 active:scale-[0.98]"
            >
              <Settings className="size-4" aria-hidden />
              Configurar
            </button>
            <button
              type="button"
              className="group inline-flex h-10 items-center justify-center gap-2 rounded-[6px] bg-accent px-3 text-sm font-medium text-on-accent transition duration-150 hover:bg-accent/85 active:scale-[0.98]"
            >
              {connector.openLabel}
              <ArrowUpRight
                className="size-4 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden
              />
            </button>
          </div>
        </div>
        <MetricsRow
          metrics={connector.connected ? usageMetrics : zeroMetrics}
          className="bg-surface/40"
        />
      </div>

      {!connector.connected && <ConnectSteps />}
      <McpLibrary />
    </div>
  )
}

function Overview({ onOpenConnector }: { onOpenConnector: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-bold leading-6 text-ink">Uso geral</h2>
        <MetricsRow metrics={usageMetrics} className="bg-canvas" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-base font-bold leading-6 text-ink">Conexões</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {connectors.map((c) => (
            <div
              key={c.id}
              className="flex flex-col gap-4 rounded-[8px] border border-line bg-elevated p-4 transition duration-200 hover:-translate-y-0.5 hover:border-neutral-300"
            >
              <div className="flex flex-col gap-2">
                <img src={c.logo} alt="" className={cn('size-10 shrink-0', c.id === 'chatgpt' && 'dark:invert')} />
                <div className="flex flex-col gap-1">
                  <p className="text-base font-bold leading-6 text-ink">{c.name}</p>
                  <Status connected={c.connected} />
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenConnector(c.id)}
                className={cn(
                  'inline-flex h-10 min-w-[112px] items-center justify-center rounded-[6px] px-3 text-sm font-medium transition duration-150 active:scale-[0.98]',
                  c.connected
                    ? 'bg-neutral-200 text-ink hover:bg-neutral-300'
                    : 'bg-accent text-on-accent hover:bg-accent/85',
                )}
              >
                {c.connected ? 'Detalhes' : 'Conectar'}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export function KentoMcpPage() {
  const [activeTab, setActiveTab] = useState<string>('overview')
  const activeConnector = connectors.find((c) => c.id === activeTab)

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: <TabGridIcon className="size-4" aria-hidden /> },
    ...connectors.map((c) => ({
      id: c.id,
      label: c.tabLabel,
      icon: <img src={c.logo} alt="" className={cn('size-4 shrink-0 object-contain', c.id === 'chatgpt' && 'dark:invert')} />,
    })),
  ]

  return (
    <PageContainer className="flex flex-col gap-10 py-6">
      <div className="flex flex-col gap-4">
        <header>
          <h1 className="text-[22px] font-bold leading-6 text-ink">Kento MCP</h1>
          <p className="mt-1 text-sm leading-5 text-muted">Conecte nossa IA no seu dia a dia</p>
        </header>

        <div className="flex gap-4 overflow-x-auto border-b border-line">
          {tabs.map((t) => {
            const active = activeTab === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 border-b pb-2 pt-3 text-sm font-medium transition-colors',
                  active ? 'border-brand-border text-brand-text' : 'border-transparent text-neutral-400 hover:text-muted',
                )}
              >
                <span className={cn('flex size-4 items-center justify-center', active ? 'text-brand-text' : 'text-neutral-400')}>
                  {t.icon}
                </span>
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* key por aba: conteúdo entra com um fade curto ao alternar */}
      <div key={activeTab} className="animate-page">
        {activeConnector ? (
          <ConnectorView connector={activeConnector} />
        ) : (
          <Overview onOpenConnector={setActiveTab} />
        )}
      </div>
    </PageContainer>
  )
}
