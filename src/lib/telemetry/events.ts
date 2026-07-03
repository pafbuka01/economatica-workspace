// Dicionário canônico de eventos do Workspace (workspace-events-v1,
// ECO2025-1927). É contrato compartilhado com a Central
// (POST /api/workspace/events valida por esta lista) e com o projeto PostHog —
// mudou aqui, muda lá e bump de versão. Nome fora da lista não trafega.

export const WORKSPACE_EVENTS_VERSION = 'workspace-events-v1'

export const WORKSPACE_EVENTS = [
  'login',
  'onboarding_completed',
  'shortcut_click',
  'connector_view',
  'connector_enable',
  'api_key_generated',
  'library_open',
  'library_filter_profile',
  'trial_requested',
] as const

export type WorkspaceEventName = (typeof WORKSPACE_EVENTS)[number]

export type WorkspaceEventProperties = Record<string, string | number | boolean | null>
