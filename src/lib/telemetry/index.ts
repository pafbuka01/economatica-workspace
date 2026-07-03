// Telemetria do Workspace (F4d, ECO2025-1927). Dupla escrita opt-in por env:
//
//   PostHog (produto/funil)  — só com VITE_POSTHOG_KEY; import dinâmico
//     (nada do posthog-js entra no caminho crítico sem a key), autocapture
//     DESLIGADO: só eventos explícitos do dicionário workspace-events-v1.
//   Sinais de negócio        — só com VITE_WORKSPACE_EVENTS_URL (endpoint que
//     o BFF expõe e encaminha pra Central com o X-Intake-Token); fila em
//     memória com batch e eventId uuid (idempotência ponta a ponta).
//
// Sem as envs o app se comporta EXATAMENTE como hoje: track() é no-op
// silencioso. Identidade: enquanto o login unificado (F1) não chega, usamos um
// uuid anônimo persistido; a Central guarda os eventos sem conta vinculada e o
// PostHog faz alias quando o identify(sub do Keycloak) chegar.

import type { WorkspaceEventName, WorkspaceEventProperties } from './events'
import { WORKSPACE_EVENTS_VERSION } from './events'

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined
const POSTHOG_HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) || 'https://us.i.posthog.com'
const EVENTS_URL = import.meta.env.VITE_WORKSPACE_EVENTS_URL as string | undefined

const ANON_STORAGE_KEY = 'eco-workspace-anon-uuid'
const FLUSH_INTERVAL_MS = 5000
const FLUSH_BATCH = 20
const MAX_QUEUE = 200

interface QueuedEvent {
  eventId: string
  userUuid: string
  event: WorkspaceEventName
  properties: WorkspaceEventProperties
  occurredAt: string
}

let posthogClient: { capture: (name: string, props?: Record<string, unknown>) => void } | null = null
let posthogLoading = false
const queue: QueuedEvent[] = []
let flushTimer: number | null = null
let listenersBound = false

function anonUuid(): string {
  try {
    const existing = window.localStorage.getItem(ANON_STORAGE_KEY)
    if (existing) return existing
    const fresh = crypto.randomUUID()
    window.localStorage.setItem(ANON_STORAGE_KEY, fresh)
    return fresh
  } catch {
    return crypto.randomUUID()
  }
}

function loadPosthog(): void {
  if (!POSTHOG_KEY || posthogClient || posthogLoading) return
  posthogLoading = true
  import('posthog-js')
    .then(({ default: posthog }) => {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        persistence: 'localStorage',
      })
      posthogClient = posthog
    })
    .catch(() => {
      // PostHog fora do ar/bloqueado não pode quebrar o app.
      posthogLoading = false
    })
}

function flush(useBeacon = false): void {
  if (!EVENTS_URL || queue.length === 0) return
  const batch = queue.splice(0, FLUSH_BATCH)
  const body = JSON.stringify({ events: batch })
  if (useBeacon && 'sendBeacon' in navigator) {
    navigator.sendBeacon(EVENTS_URL, new Blob([body], { type: 'application/json' }))
    return
  }
  void fetch(EVENTS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {
    // Melhor perder telemetria do que repetir com risco de duplicar cadeia
    // acima: o eventId protege contra duplo-envio, não contra loop de retry.
  })
  if (queue.length > 0) scheduleFlush()
}

function scheduleFlush(): void {
  if (flushTimer != null) return
  flushTimer = window.setTimeout(() => {
    flushTimer = null
    flush()
  }, FLUSH_INTERVAL_MS)
}

function bindLifecycleFlush(): void {
  if (listenersBound) return
  listenersBound = true
  window.addEventListener('pagehide', () => flush(true))
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush(true)
  })
}

/**
 * Registra um evento do dicionário. Seguro de chamar de qualquer lugar:
 * sem envs configuradas é no-op, nunca lança, nunca bloqueia a UI.
 */
export function track(event: WorkspaceEventName, properties: WorkspaceEventProperties = {}): void {
  try {
    const props = { ...properties, schema: WORKSPACE_EVENTS_VERSION }
    if (POSTHOG_KEY) {
      loadPosthog()
      posthogClient?.capture(event, props)
    }
    if (EVENTS_URL) {
      if (queue.length >= MAX_QUEUE) queue.shift()
      queue.push({
        eventId: crypto.randomUUID(),
        userUuid: anonUuid(),
        event,
        properties: props,
        occurredAt: new Date().toISOString(),
      })
      bindLifecycleFlush()
      if (queue.length >= FLUSH_BATCH) flush()
      else scheduleFlush()
    }
  } catch {
    // Telemetria jamais derruba a experiência.
  }
}
