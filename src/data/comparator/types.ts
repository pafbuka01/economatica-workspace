/** Tipos do comparador de empresas — base Economatica (ações B3). */

/** Chave de métrica numérica presente em `Company.metrics`. */
export type MetricKey = string

/** Direção de leitura da métrica: em P/L menor é melhor, em ROE maior é melhor. */
export type MetricDirection = 'higher' | 'lower' | 'neutral'

export type MetricUnit = 'x' | 'pct' | 'brl' | 'brlThousands'

/** Agrupamento das linhas da tabela. */
export type MetricBlock =
  | 'tamanho'
  | 'valuation'
  | 'rentabilidade'
  | 'alavancagem'
  | 'retorno'
  | 'risco'
  | 'liquidez'

export interface MetricDef {
  key: MetricKey
  label: string
  block: MetricBlock
  unit: MetricUnit
  direction: MetricDirection
  decimals: number
  /**
   * Múltiplo de preço: valor negativo é "não significativo" (n/m), nunca barato.
   * A UI marca n/m e a métrica fica fora do heatmap.
   */
  priceMultiple?: boolean
  /** Depende de enterprise value, que a fonte não calcula para bancos/seguradoras. */
  requiresEv?: boolean
  /** Texto do tooltip explicando a métrica. */
  hint?: string
}

export interface Company {
  ticker: string
  name: string
  cnpj: string
  shareClass: string | null
  sector: string
  subsector: string | null
  segment: string | null
  listing: string | null
  /** Classe mais líquida do CNPJ — é ela que representa a empresa em ranking. */
  isPrimaryClass: boolean
  /** Demais classes da mesma empresa (mesmo CNPJ). */
  classPeers: string[]
  /** Bancos e seguradoras: EV nulo na fonte, múltiplo de EV não se aplica. */
  evNotApplicable: boolean
  metrics: Record<MetricKey, number | null>
}

/** Distribuição de uma métrica dentro de um setor. */
export interface MetricDistribution {
  n: number
  min: number
  p25: number
  median: number
  p75: number
  max: number
}

export type SectorStats = Record<string, Record<MetricKey, MetricDistribution>>

export interface SnapshotMeta {
  source: string
  /** Trimestre dos fundamentos (balanço). */
  fundamentalsQuarter: string
  fundamentalsQuarterEnd: string
  /** Data do preço — sempre mais recente que o balanço. */
  marketDataAsOf: string
  tickerCount: number
  companyCount: number
  sectorCount: number
  evNotApplicableCount: number
}

export interface Snapshot {
  meta: SnapshotMeta
  sectorStats: SectorStats
  companies: Company[]
}

/** Por que uma célula não tem número — cada caso se lê diferente. */
export type CellStatus =
  | 'ok'
  /** Múltiplo de preço negativo: não significativo. */
  | 'nm'
  /** Métrica não se aplica ao setor (EV em banco). */
  | 'na'
  /** Sem dado publicado na fonte. */
  | 'missing'

export interface MetricCell {
  status: CellStatus
  value: number | null
  /** Posição na seleção atual, 0 (pior) a 1 (melhor). Null se não comparável. */
  rank: number | null
  /** Percentil dentro do setor da empresa, 0 a 100. */
  sectorPercentile: number | null
  distribution: MetricDistribution | null
}

/**
 * Fonte de dados do comparador. Hoje resolve contra o snapshot versionado;
 * trocar por API ao vivo é reimplementar esta interface.
 */
export interface ComparatorSource {
  meta: SnapshotMeta
  /** Busca por ticker ou nome sobre todo o universo. */
  search(query: string, limit?: number): Company[]
  get(ticker: string): Company | undefined
  /** Pares do setor da empresa, os mais líquidos primeiro. */
  peersOf(ticker: string, limit?: number): Company[]
  distribution(sector: string, metric: MetricKey): MetricDistribution | null
  /** Universo completo (uma linha por ticker). */
  all(): Company[]
}
