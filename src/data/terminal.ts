import tutorialThumb from '@/assets/thumbs/terminal-tutorial.png'
import updateThumb from '@/assets/terminal-update.png'

export interface TerminalStat {
  label: string
  value: string
  /** Complemento ao lado do valor (ex.: "de 3.000"). */
  detail?: string
}

/** Métricas de uso do Terminal (valores mockados). */
export const terminalStats: TerminalStat[] = [
  { label: 'Chamadas Kento Terminal', value: '1.247', detail: 'de 3.000' },
  { label: 'Workspaces ativos', value: '6', detail: 'de 8' },
  { label: 'Status do mercado', value: 'Aberto' },
]

export interface Tutorial {
  title: string
  duration: string
  /** Destaque em ciano antes da duração (ex.: "Comece por aqui"). */
  highlight?: string
  thumb: string
}

/** Tutoriais em vídeo do Terminal (grade 3×2 do comp). */
export const tutorials: Tutorial[] = [
  { title: 'Visão geral e primeiro acesso', duration: '1m15s', highlight: 'Comece por aqui', thumb: tutorialThumb },
  { title: 'Montando e organizando seu primeiro workspace', duration: '1m15s', thumb: tutorialThumb },
  { title: 'Aprenda a usar o Kento no seu Terminal', duration: '1m15s', thumb: tutorialThumb },
  { title: 'Módulos básicos', duration: '1m15s', thumb: tutorialThumb },
  { title: 'Módulos intermediários', duration: '1m15s', thumb: tutorialThumb },
  { title: 'Módulos avançados', duration: '1m15s', thumb: tutorialThumb },
]

export interface TerminalUpdate {
  title: string
  date: string
  description: string
  /** Selo "Novo" em ciano. */
  isNew?: boolean
  /** Imagem ilustrativa (só o primeiro item do comp). */
  image?: string
}

/** Feed "Últimos updates" (conteúdo do comp). */
export const terminalUpdates: TerminalUpdate[] = [
  {
    title: 'Personalização de workspaces',
    date: '01/07/2026',
    description: 'Organize seus módulos do seu jeito e monte a área de trabalho ideal.',
    isNew: true,
    image: updateThumb,
  },
  {
    title: 'Módulo de Acionistas',
    date: '01/06/2026',
    description: 'Consulte a composição acionária e os principais movimentos das empresas.',
  },
  {
    title: 'Módulo de Fundos',
    date: '01/07/2026',
    description: 'Visão 360° de mais de 25.000 fundos, com carteiras e evolução histórica.',
  },
  {
    title: 'Nova busca global',
    date: '01/07/2026',
    description: 'Encontre ativos, módulos e dados mais rápido, em um único lugar.',
  },
  {
    title: 'Detalhamento de ativos',
    date: '01/07/2026',
    description: 'Resumo, indicadores e sentimento de mercado reunidos em cada ativo.',
  },
]
