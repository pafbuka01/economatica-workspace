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

export interface LibraryPrompt {
  tags: string[]
  title: string
  description: string
  prompt: string
}

export const libraryPrompts: LibraryPrompt[] = [
  {
    tags: ['Prompt', 'Workflow'],
    title: 'Análise de carteira do cliente',
    description: 'Primeira consulta para o assessor entender concentração, riscos, eventos e pontos de conversa com o cliente.',
    prompt: 'Analise a carteira do meu cliente e destaque concentração, riscos e eventos relevantes.',
  },
  {
    tags: ['Prompt'],
    title: 'Resumo de resultados trimestrais',
    description: 'Sintetiza o balanço mais recente de um ativo com os destaques que importam para o cliente.',
    prompt: 'Resuma os resultados do último trimestre da PETR4 em 5 pontos.',
  },
  {
    tags: ['Prompt', 'Workflow'],
    title: 'Screener de ações defensivas',
    description: 'Monta uma lista de ações da B3 com perfil defensivo e boa liquidez.',
    prompt: 'Monte um screener de ações B3 defensivas com boa liquidez e dividend yield acima de 6%.',
  },
  {
    tags: ['Prompt'],
    title: 'Comparação de múltiplos',
    description: 'Compara valuation entre pares do mesmo setor para embasar uma recomendação.',
    prompt: 'Compare P/L, EV/EBITDA e dividend yield de PETR4, PRIO3 e RECV3.',
  },
  {
    tags: ['Prompt', 'Workflow'],
    title: 'Sentimento de notícias',
    description: 'Avalia o tom das notícias recentes de um ativo nos últimos 30 dias.',
    prompt: 'Qual o sentimento das notícias recentes sobre VALE3 nos últimos 30 dias?',
  },
  {
    tags: ['Prompt'],
    title: 'Calendário de eventos',
    description: 'Lista os próximos eventos corporativos e macroeconômicos da semana.',
    prompt: 'Quais eventos corporativos e resultados saem nesta semana na B3?',
  },
]

export const libraryTabs = ['Pra você', 'Prompts', 'Skills', 'Artefatos']
