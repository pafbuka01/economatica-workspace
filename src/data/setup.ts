export type SetupIconKind = 'mcp' | 'excel' | 'terminal' | 'code'

export interface SetupItem {
  icon: SetupIconKind
  title: string
  description: string
  /** Texto do botão de ação primário. */
  cta: string
  /** Rota de destino do botão de ação. */
  to: string
}

/** Itens do "Setup inicial" da Home (ordem do comp). */
export const setupItems: SetupItem[] = [
  {
    icon: 'mcp',
    title: 'Conectar MCP à sua inteligência artificial',
    description: 'Siga os passos para usar todo o poder do ecossistema Economatica.',
    cta: 'Conectar',
    to: '/kento-mcp',
  },
  {
    icon: 'excel',
    title: 'Conectar Economatica ao Excel',
    description: 'Siga os passos para usar todo o poder do ecossistema Economatica.',
    cta: 'Conectar',
    to: '/excel',
  },
  {
    icon: 'terminal',
    title: 'Criar primeiro workspace no Terminal',
    description: 'Siga os passos para usar todo o poder do ecossistema Economatica.',
    cta: 'Acessar',
    to: '/terminal',
  },
  {
    icon: 'code',
    title: 'Conectar API de dados Economatica',
    description: 'Siga os passos para usar todo o poder do ecossistema Economatica.',
    cta: 'Configurar',
    to: '/apis',
  },
]
