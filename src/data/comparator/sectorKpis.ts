/**
 * KPIs gerenciais por setor — o que diferencia este comparador de um comparador
 * genérico de múltiplos.
 *
 * Fundamento contábil (P/L, ROE, margem) responde "quanto vale e quanto rende".
 * KPI gerencial responde "por quê": um banco se compara por Basileia e
 * inadimplência, uma varejista por SSS, uma incorporadora por VSO. Esses números
 * saem dos releases oficiais e vêm da Economatica COM PROVENIÊNCIA — documento
 * CVM, página e trecho citado.
 *
 * Contrato de auditabilidade da fonte: todo número exibido carrega o link do
 * documento de origem ao lado. `KpiValue.citation` nunca é opcional na UI.
 */

export interface KpiDef {
  code: string
  label: string
  unit: 'pct' | 'brlMillions' | 'x'
  /** Direção de leitura, como nas métricas de fundamento. */
  direction: 'higher' | 'lower' | 'neutral'
  hint?: string
}

export interface KpiCitation {
  /** Identificador do documento na CVM (ex.: cvm-1552006). */
  document: string
  page: string
  url: string
  /** Trecho literal de onde o número foi extraído. */
  snippet: string
  /** Confiança da extração, 0 a 1. */
  confidence: number
}

export interface KpiValue {
  ticker: string
  code: string
  value: number
  quarter: string
  citation: KpiCitation
}

/** Catálogo por setor Bovespa. Os códigos vêm do catálogo da Economatica. */
export const SECTOR_KPIS: Record<string, KpiDef[]> = {
  Bancos: [
    {
      code: 'basel_ratio',
      label: 'Índice de Basileia',
      unit: 'pct',
      direction: 'higher',
      hint: 'Capital sobre ativos ponderados pelo risco. Mínimo regulatório de 10,5% no Brasil.',
    },
    {
      code: 'cet1_ratio',
      label: 'CET1',
      unit: 'pct',
      direction: 'higher',
      hint: 'Capital principal — a fatia de maior qualidade do Basileia.',
    },
    {
      code: 'npl_90_ratio',
      label: 'Inadimplência 90+',
      unit: 'pct',
      direction: 'lower',
      hint: 'Carteira vencida há mais de 90 dias. Menor é melhor.',
    },
    {
      code: 'coverage_ratio',
      label: 'Índice de cobertura',
      unit: 'pct',
      direction: 'higher',
      hint: 'Provisão sobre carteira inadimplente.',
    },
    {
      code: 'loan_book_expanded',
      label: 'Carteira de crédito ampliada',
      unit: 'brlMillions',
      direction: 'neutral',
    },
  ],
}

/**
 * Valores coletados neste snapshot. Cobertura parcial e deliberada: o KPI
 * gerencial é extraído release a release, então nem todo trimestre de todo
 * emissor existe. Ausência aqui significa "não coletado ou não publicado" —
 * a UI diz isso, nunca preenche o buraco.
 */
export const KPI_VALUES: KpiValue[] = [
  {
    ticker: 'ITUB4',
    code: 'basel_ratio',
    value: 15.4,
    quarter: '2T2026',
    citation: {
      document: 'cvm-1552006',
      page: 'Página 3 — Sumário Executivo',
      url: 'https://www.rad.cvm.gov.br/ENETCONSULTA/frmDownloadDocumento.aspx?Tela=99&numSequencia=1076712&numVersao=1&numProtocolo=1552006&descTipo=IPE&CodigoInstituicao=1',
      snippet: 'Índice de Basileia Consolidado Prudencial 15,4% 14,8% 16,5%',
      confidence: 0.8885,
    },
  },
  {
    ticker: 'BBDC4',
    code: 'basel_ratio',
    value: 15.5,
    quarter: '2T2026',
    citation: {
      document: 'cvm-1552945',
      page: '23',
      url: 'https://www.rad.cvm.gov.br/ENETCONSULTA/frmDownloadDocumento.aspx?Tela=99&numSequencia=1077651&numVersao=1&numProtocolo=1552945&descTipo=IPE&CodigoInstituicao=1',
      snippet: 'Total Ratio 15.5% / Tier I Ratio 12.8% / Common Equity Ratio 11.3%',
      confidence: 0.983,
    },
  },
  {
    ticker: 'SANB11',
    code: 'basel_ratio',
    value: 15.3,
    quarter: '2T2026',
    citation: {
      document: 'cvm-1549117',
      page: '5',
      url: 'https://www.rad.cvm.gov.br/ENETCONSULTA/frmDownloadDocumento.aspx?Tela=99&numSequencia=1073823&numVersao=2&numProtocolo=1549117&descTipo=IPE&CodigoInstituicao=1',
      snippet: 'BIS ratio 15.3% 15.2% 0.2 p.p. 15.0% 0.3 p.p.',
      confidence: 0.983,
    },
  },
]

const VALUE_INDEX = new Map(KPI_VALUES.map((v) => [`${v.ticker}:${v.code}`, v]))

export const kpiValue = (ticker: string, code: string): KpiValue | undefined =>
  VALUE_INDEX.get(`${ticker}:${code}`)

/**
 * Catálogo aplicável a uma seleção: só quando TODAS compartilham o segmento.
 * Comparar Basileia de um banco com "n/a" de uma mineradora não é comparação.
 */
export function kpisForSelection(segments: Array<string | null>): KpiDef[] | null {
  const unique = new Set(segments.filter(Boolean) as string[])
  if (unique.size !== 1) return null
  const [segment] = [...unique]
  return SECTOR_KPIS[segment] ?? null
}

export function formatKpi(value: number, def: KpiDef): string {
  switch (def.unit) {
    case 'pct':
      return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%`
    case 'brlMillions':
      return `R$ ${(value / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} bi`
    default:
      return `${value.toLocaleString('pt-BR')}x`
  }
}
