import mcpThumb from '@/assets/thumbs/mcp.png'
import terminalThumb from '@/assets/thumbs/terminal.png'
import excelThumb from '@/assets/thumbs/excel.png'
import plataformaThumb from '@/assets/thumbs/plataforma.png'

export interface VideoItem {
  title: string
  description: string
  duration: string
  thumb: string
}

/** Vídeos da seção "Veja como funciona". */
export const videos: VideoItem[] = [
  {
    title: 'MCP Economatica',
    description: 'Conheça o futuro da análise financeira dentro da sua inteligência artificial',
    duration: '1m15s',
    thumb: mcpThumb,
  },
  {
    title: 'Terminal',
    description: 'Um tour pelo terminal mais completo e intuitivo do mercado financeiro',
    duration: '1m15s',
    thumb: terminalThumb,
  },
  {
    title: 'Kento no Excel',
    description: 'Nossa IA totalmente integrada às suas planilhas de Excel, conheça no vídeo',
    duration: '1m15s',
    thumb: excelThumb,
  },
  {
    title: 'Plataforma Economatica',
    description: 'Consulta, análise e screener sobre 40 anos de base proprietária',
    duration: '1m15s',
    thumb: plataformaThumb,
  },
]
