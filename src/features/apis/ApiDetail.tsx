import { HelpCircle } from 'lucide-react'
import { cn } from '@/lib/cn'
import { ActivityChart } from './ApiCard'
import {
  apiIds,
  apiMetrics,
  apiCallHistory,
  apiConfig,
  type ApiService,
} from '@/data/apis'
import avatarImg from '@/assets/avatar.png'

/* ----------------------------- Metadados ----------------------------- */

function MetaItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 px-6 first:pl-0 sm:first:pl-6">
      <p className="text-[12.25px] font-medium leading-5 text-[#6b7280]">{label}</p>
      <div className="flex h-6 items-center gap-2">{children}</div>
    </div>
  )
}

function MetadataRow() {
  return (
    <div className="flex flex-col gap-4 border-y border-line py-5 sm:flex-row sm:items-center sm:gap-0 sm:divide-x sm:divide-line">
      <MetaItem label="API ID">
        <p className="font-mono text-[14.4px] leading-6 text-ink">api/economatica-dados</p>
      </MetaItem>
      <MetaItem label="Created by">
        <img src={avatarImg} alt="" className="size-5 shrink-0 rounded-full object-cover" />
        <p className="text-sm leading-5 text-ink">Gustavo Figueira • 8h ago</p>
      </MetaItem>
      <MetaItem label="Last update">
        <img src={avatarImg} alt="" className="size-5 shrink-0 rounded-full object-cover" />
        <p className="text-sm leading-5 text-ink">Admin • 2h ago</p>
      </MetaItem>
    </div>
  )
}

/* ------------------------- Status + métricas ------------------------- */

function StatusPanel({ api }: { api: ApiService }) {
  return (
    <div className="flex flex-col divide-y divide-line rounded-[8px] border border-line bg-canvas lg:flex-row lg:divide-x lg:divide-y-0">
      <div className="flex min-w-0 flex-col gap-3 p-4 lg:w-[339px] lg:shrink-0">
        <div>
          <h3 className="text-base font-bold leading-6 text-ink">{api.name}</h3>
          <p className="mt-1 flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-full bg-success-500" />
            <span className="text-xs font-medium leading-4 text-positive-text">
              Em funcionamento
            </span>
          </p>
        </div>
        <ActivityChart />
      </div>
      {apiMetrics.map((m) => (
        <div key={m.label} className="flex min-w-0 flex-1 flex-col justify-center gap-1 p-4">
          <p className="text-[32px] font-bold leading-10 text-ink">{m.value}</p>
          <p className="text-sm leading-5 text-muted">{m.label}</p>
        </div>
      ))}
    </div>
  )
}

/* ----------------------- Histórico de chamadas ----------------------- */

function StatusBadge({ status }: { status: 'success' | 'error' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium leading-4',
        status === 'success' ? 'bg-[#dcfce7] text-[#16a34a]' : 'bg-[#fee2e2] text-[#dc2626]',
      )}
    >
      {status === 'success' ? 'Sucesso' : 'Erro'}
    </span>
  )
}

function CallHistory({ apiId }: { apiId: string }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-base font-bold leading-6 text-ink">Histórico de chamadas</h2>
      <div className="overflow-x-auto rounded-[8px] border border-line">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="bg-elevated">
              <th className="px-4 py-3 text-sm font-medium leading-[21px] text-muted">Nome da API</th>
              <th className="px-4 py-3 text-sm font-medium leading-[21px] text-muted">Status da chamada</th>
              <th className="px-4 py-3 text-sm font-medium leading-[21px] text-muted">Local da chamada</th>
              <th className="px-4 py-3 text-sm font-medium leading-[21px] text-muted">ID da chamada</th>
            </tr>
          </thead>
          <tbody>
            {apiCallHistory.map((call) => (
              <tr key={call.id} className="border-t border-line even:bg-[#f9fafb]">
                <td className="w-[34%] px-4 py-3.5 text-sm leading-5 text-ink">{apiId}</td>
                <td className="w-[15%] px-4 py-3">
                  <StatusBadge status={call.status} />
                </td>
                <td className="w-[25%] px-4 py-3.5 text-sm leading-5 text-ink">{call.location}</td>
                <td className="px-4 py-3.5 text-sm leading-5 text-muted">{call.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

/* ----------------------------- Configuração ----------------------------- */

function ConfigField({
  label,
  children,
  hint,
}: {
  label: string
  children: React.ReactNode
  hint?: boolean
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-[#6b7280]">
        {label}
        {hint && <HelpCircle className="size-3.5 text-[#6b7280]" aria-hidden />}
      </p>
      {children}
    </div>
  )
}

function CodeValue({ children }: { children: string }) {
  return (
    <p className="w-full break-all rounded-[4px] bg-[#f3f4f6] px-2 py-1 font-mono text-sm text-ink">
      {children}
    </p>
  )
}

function Configuration() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-base font-bold leading-6 text-ink">Configuração</h2>
      <div className="flex flex-col gap-8 rounded-[12px] border border-line bg-white p-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:gap-12">
          <ConfigField label="Endpoint URL">
            <CodeValue>{apiConfig.endpoint}</CodeValue>
          </ConfigField>
          <ConfigField label="Authentication Type">
            <p className="text-sm text-ink">{apiConfig.authType}</p>
          </ConfigField>
          <ConfigField label="API Key" hint>
            <p className="text-sm text-ink">{apiConfig.apiKey}</p>
          </ConfigField>
        </div>
        <div className="flex flex-col gap-8 sm:flex-row sm:gap-12">
          <ConfigField label="Version">
            <CodeValue>{apiConfig.version}</CodeValue>
          </ConfigField>
          <ConfigField label="Environment">
            <p className="text-sm text-ink">{apiConfig.environment}</p>
          </ConfigField>
          <ConfigField label="Status">
            <span className="inline-flex items-center gap-1.5 self-start rounded-[4px] bg-[rgba(16,185,129,0.1)] px-2 py-1">
              <span className="size-2 rounded-full bg-[#10b981]" />
              <span className="text-[13px] font-semibold text-[#10b981]">Active</span>
            </span>
          </ConfigField>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------- Página ------------------------------- */

export function ApiDetail({ api }: { api: ApiService }) {
  const apiId = apiIds[api.id] ?? api.id
  return (
    <div className="flex flex-col gap-10">
      <MetadataRow />
      <StatusPanel api={api} />
      <CallHistory apiId={apiId} />
      <Configuration />
    </div>
  )
}
