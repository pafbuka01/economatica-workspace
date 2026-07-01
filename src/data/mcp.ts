import anthropicLogo from '@/assets/brand/mcp-anthropic.svg'
import chatgptLogo from '@/assets/brand/mcp-chatgpt.svg'
import copilotLogo from '@/assets/brand/mcp-copilot.svg'
import excelLogo from '@/assets/brand/mcp-excel.svg'

export interface Connector {
  id: string
  /** Nome completo exibido no header e nos cards. */
  name: string
  /** Rótulo curto da aba. */
  tabLabel: string
  /** Texto do botão "Abrir …". */
  openLabel: string
  connected: boolean
  logo: string
}

export const connectors: Connector[] = [
  { id: 'claude', name: 'Anthropic Claude', tabLabel: 'Claude', openLabel: 'Abrir Claude', connected: true, logo: anthropicLogo },
  { id: 'copilot', name: 'Microsoft Copilot', tabLabel: 'Copilot', openLabel: 'Abrir Copilot', connected: false, logo: copilotLogo },
  { id: 'chatgpt', name: 'ChatGPT', tabLabel: 'ChatGPT', openLabel: 'Abrir ChatGPT', connected: false, logo: chatgptLogo },
  { id: 'excel', name: 'Kento Excel', tabLabel: 'Excel', openLabel: 'Abrir no Excel', connected: true, logo: excelLogo },
]

export interface Metric {
  label: string
  value: string
  trend?: string
}

/** Métricas de uso (valores mockados). NOTA: o comp lista "Chamadas MCP" duas vezes. */
export const usageMetrics: Metric[] = [
  { label: 'Chamadas MCP', value: '1.247', trend: '+12% este mês' },
  { label: 'Tokens Usados', value: '84.320', trend: '+8% este mês' },
  { label: 'Chamadas MCP', value: '1.247', trend: '+12% este mês' },
  { label: 'Taxa de Sucesso', value: '98.4%', trend: 'Excelente' },
]

export interface ConnectStep {
  description: string
  fields?: { label: string; value: string }[]
  note?: string
}

/**
 * Passo a passo para conectar. Baseado no fluxo real do Claude e generalizado
 * como placeholder para os demais assistentes (o passo do servidor é comum a todos).
 */
export const connectSteps: ConnectStep[] = [
  {
    description:
      'No seu assistente (Claude, ChatGPT ou Copilot), abra as configurações e localize a seção de Conectores (MCP).',
  },
  {
    description:
      'Escolha adicionar um conector personalizado (Add custom connector).',
  },
  {
    description: 'Preencha o formulário com os dados do servidor Economatica:',
    fields: [
      { label: 'Nome', value: 'Economatica' },
      { label: 'URL do servidor', value: 'https://news-api.economatica.com/v1/mcp' },
    ],
    note: 'Esse endereço diz ao assistente onde os dados da Economatica ficam; só copie e cole.',
  },
  {
    description:
      'Confirme para adicionar. O assistente abrirá a tela de login da Economatica, operada pelo provedor de identidade — a barra do navegador mostra econewsapi.us.auth0.com, e é esse endereço que confirma que a tela é legítima.',
  },
  {
    description:
      'Entre com seu usuário Economatica. Pronto — o conector aparece na sua lista, com as ferramentas descobertas automaticamente.',
  },
]

// Prompts da Biblioteca agora vivem em data/library.ts (compartilhados com Skills e Prompts).
export { libraryPrompts, type LibraryPrompt } from './library'

export const libraryTabs = ['Pra você', 'Prompts', 'Skills', 'Artefatos']
