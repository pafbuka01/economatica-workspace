/** Sugestões de prompt exibidas no popover dos chips (texto do comp). */
export const chipSuggestions = [
  'Compare AXIA3, CMIG4, CPFE3 e SBSP3 em múltiplos',
  'Quais resultados saem essa semana?',
  'Monte um screener de ações B3 defensivas com liquidez',
  'Como está o sentimento de PETR4 vs PRIO3 nos últimos 30 dias?',
  'Quais notícias da Petrobras na última semana sobre dividendos?',
]

export interface ChartBar {
  /** Rótulo do eixo X. */
  month: string
  /** Valor realizado (barra ciano). */
  value: number
  /** Total (realizado + projeção); a diferença vira a barra cinza. */
  total: number
}

export interface ChartData {
  source: string
  title: string
  max: number
  bars: ChartBar[]
  caption: string
}

export interface ChatMessage {
  role: 'user' | 'bot'
  paragraphs: string[]
  chart?: ChartData
}

const mockChart: ChartData = {
  source: 'Fundamentos',
  title: 'Receita líquida trimestral (R$ mi)',
  max: 1000,
  bars: [
    { month: 'Jan', value: 460, total: 640 },
    { month: 'Fev', value: 610, total: 820 },
    { month: 'Mar', value: 320, total: 440 },
    { month: 'Abr', value: 500, total: 680 },
    { month: 'Mai', value: 400, total: 500 },
    { month: 'Jun', value: 560, total: 720 },
    { month: 'Jul', value: 580, total: 820 },
    { month: 'Ago', value: 450, total: 650 },
    { month: 'Set', value: 500, total: 640 },
    { month: 'Out', value: 470, total: 620 },
    { month: 'Nov', value: 610, total: 810 },
    { month: 'Dez', value: 440, total: 560 },
  ],
  caption: 'Barras em ciano representam o valor realizado; em cinza, a projeção do consenso.',
}

/** Resposta mockada do Kento — rica o bastante para exibir todo o layout num único envio. */
export function buildMockReply(): ChatMessage {
  return {
    role: 'bot',
    paragraphs: [
      'Analisei os principais fundamentos e a evolução recente. No consolidado dos últimos 12 meses, a receita mostrou crescimento consistente, com aceleração no segundo semestre e margem operacional estável.',
      'Abaixo, a série de receita líquida trimestral reconstruída a partir da base proprietária. Vale acompanhar o descolamento entre realizado e projeção nos meses de pico.',
    ],
    chart: mockChart,
    // caption fica no próprio chart
  }
}
