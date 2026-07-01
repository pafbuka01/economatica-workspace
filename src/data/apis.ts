import type { Tutorial } from '@/data/terminal'
import tutorialThumb from '@/assets/thumbs/terminal-tutorial.png'

export interface ApiService {
  id: string
  name: string
}

/** APIs disponíveis (ordem do comp). */
export const apiServices: ApiService[] = [
  { id: 'noticias', name: 'Notícias' },
  { id: 'fundamentos', name: 'Fundamentos' },
  { id: 'fundos', name: 'Fundos' },
]

/** Identificador técnico exibido na página interna de cada API. */
export const apiIds: Record<string, string> = {
  noticias: 'api/news',
  fundamentos: 'api/fundamentals',
  fundos: 'api/funds',
}

export interface ApiMetric {
  value: string
  label: string
}

/** Métricas da página interna (valores mockados do comp). */
export const apiMetrics: ApiMetric[] = [
  { value: '2.4M', label: 'Requests (24h)' },
  { value: '14ms', label: 'Latência' },
  { value: '99.98%', label: 'Success Rate' },
]

export interface ApiCall {
  status: 'success' | 'error'
  location: string
  id: string
}

/** Histórico de chamadas (linhas do comp). */
export const apiCallHistory: ApiCall[] = [
  { status: 'success', location: 'Site institucional', id: 'req_01JX9A2K' },
  { status: 'success', location: 'App Mobile', id: 'req_01JX9A1M' },
  { status: 'error', location: 'Dashboard interno', id: 'req_01JX98ZP' },
  { status: 'success', location: 'Site institucional', id: 'req_01JX97YQ' },
  { status: 'success', location: 'Extensão Chrome', id: 'req_01JX96XR' },
  { status: 'success', location: 'API interna', id: 'req_01JX95WS' },
  { status: 'error', location: 'App Mobile', id: 'req_01JX94VT' },
  { status: 'success', location: 'Dashboard interno', id: 'req_01JX93UU' },
]

/** Configuração exibida no fim da página interna. */
export const apiConfig = {
  endpoint: 'https://api.economatica.com/v1/data/endpoints/stream',
  authType: 'Bearer Token',
  apiKey: '••••••••••••••••••••',
  version: 'v1.4.2-stable',
  environment: 'Production',
}

/** Tutoriais da página de APIs (títulos do comp). */
export const apiTutorials: Tutorial[] = [
  { title: 'Visão geral e primeiro acesso', duration: '1m15s', highlight: 'Comece por aqui', thumb: tutorialThumb },
  { title: 'Montando e organizando seu primeiro workspace', duration: '1m15s', thumb: tutorialThumb },
  { title: 'Montando e organizando seu primeiro workspace', duration: '1m15s', thumb: tutorialThumb },
  { title: 'Aprenda a usar o Kento no seu Terminal', duration: '1m15s', thumb: tutorialThumb },
]
