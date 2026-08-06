import type { MetricBlock, MetricDef, MetricKey } from './types'

/**
 * Catálogo de métricas do comparador.
 *
 * `direction` é o que impede o erro clássico do heatmap: em P/L e alavancagem
 * menor é melhor, em ROE e margem maior é melhor. Sem isso, a tabela pinta de
 * verde a empresa mais endividada.
 */
export const METRICS: MetricDef[] = [
  // Tamanho — referência, não se ranqueia "melhor".
  {
    key: 'market_cap_brl_thousands',
    label: 'Valor de mercado',
    block: 'tamanho',
    unit: 'brlThousands',
    direction: 'neutral',
    decimals: 0,
  },
  {
    key: 'enterprise_value_brl_thousands',
    label: 'Enterprise value',
    block: 'tamanho',
    unit: 'brlThousands',
    direction: 'neutral',
    decimals: 0,
    requiresEv: true,
  },
  {
    key: 'revenue_3m_brl_thousands',
    label: 'Receita (trimestre)',
    block: 'tamanho',
    unit: 'brlThousands',
    direction: 'neutral',
    decimals: 0,
  },
  {
    key: 'equity_brl_thousands',
    label: 'Patrimônio líquido',
    block: 'tamanho',
    unit: 'brlThousands',
    direction: 'neutral',
    decimals: 0,
  },
  {
    key: 'total_assets_brl_thousands',
    label: 'Ativo total',
    block: 'tamanho',
    unit: 'brlThousands',
    direction: 'neutral',
    decimals: 0,
  },

  // Valuation — múltiplos de preço, todos "menor é mais barato".
  {
    key: 'pe_ltm',
    label: 'P/L',
    block: 'valuation',
    unit: 'x',
    direction: 'lower',
    decimals: 1,
    priceMultiple: true,
    hint: 'Preço sobre lucro dos últimos 12 meses. Negativo = prejuízo, não desconto.',
  },
  {
    key: 'pb_ltm',
    label: 'P/VPA',
    block: 'valuation',
    unit: 'x',
    direction: 'lower',
    decimals: 2,
    priceMultiple: true,
    hint: 'Preço sobre valor patrimonial. Sozinho engana — leia junto do ROE.',
  },
  {
    key: 'ev_ebitda_ltm',
    label: 'EV/EBITDA',
    block: 'valuation',
    unit: 'x',
    direction: 'lower',
    decimals: 1,
    priceMultiple: true,
    requiresEv: true,
    hint: 'Não se aplica a bancos: a fonte não calcula enterprise value para eles.',
  },
  {
    key: 'ev_ebit_ltm',
    label: 'EV/EBIT',
    block: 'valuation',
    unit: 'x',
    direction: 'lower',
    decimals: 1,
    priceMultiple: true,
    requiresEv: true,
  },
  {
    key: 'ev_sales_ltm',
    label: 'EV/Receita',
    block: 'valuation',
    unit: 'x',
    direction: 'lower',
    decimals: 1,
    priceMultiple: true,
    requiresEv: true,
  },
  {
    key: 'psr_ltm',
    label: 'P/Receita',
    block: 'valuation',
    unit: 'x',
    direction: 'lower',
    decimals: 2,
    priceMultiple: true,
  },
  {
    key: 'pfcf_ltm',
    label: 'P/FCF',
    block: 'valuation',
    unit: 'x',
    direction: 'lower',
    decimals: 1,
    priceMultiple: true,
  },

  // Rentabilidade — maior é melhor.
  {
    key: 'roe_ltm_pct',
    label: 'ROE',
    block: 'rentabilidade',
    unit: 'pct',
    direction: 'higher',
    decimals: 1,
    hint: 'Retorno sobre patrimônio líquido nos últimos 12 meses.',
  },
  {
    key: 'roic_ltm_pct',
    label: 'ROIC',
    block: 'rentabilidade',
    unit: 'pct',
    direction: 'higher',
    decimals: 1,
  },
  { key: 'roa_ltm_pct', label: 'ROA', block: 'rentabilidade', unit: 'pct', direction: 'higher', decimals: 1 },
  {
    key: 'ebitda_margin_ltm_pct',
    label: 'Margem EBITDA',
    block: 'rentabilidade',
    unit: 'pct',
    direction: 'higher',
    decimals: 1,
  },
  {
    key: 'net_margin_ltm_pct',
    label: 'Margem líquida',
    block: 'rentabilidade',
    unit: 'pct',
    direction: 'higher',
    decimals: 1,
  },
  {
    key: 'fcf_margin_ltm_pct',
    label: 'Margem FCF',
    block: 'rentabilidade',
    unit: 'pct',
    direction: 'higher',
    decimals: 1,
  },

  // Alavancagem — menor é melhor.
  {
    key: 'net_debt_ebitda_ltm',
    label: 'Dív. líq./EBITDA',
    block: 'alavancagem',
    unit: 'x',
    direction: 'lower',
    decimals: 1,
    requiresEv: true,
    hint: 'Negativo = caixa líquido. Não se aplica a bancos.',
  },

  // Retorno ao acionista — maior é melhor.
  {
    key: 'dividend_yield_ltm_pct',
    label: 'Dividend yield',
    block: 'retorno',
    unit: 'pct',
    direction: 'higher',
    decimals: 2,
  },
  { key: 'return_1m_pct', label: 'Retorno 1 mês', block: 'retorno', unit: 'pct', direction: 'higher', decimals: 2 },
  { key: 'return_3m_pct', label: 'Retorno 3 meses', block: 'retorno', unit: 'pct', direction: 'higher', decimals: 2 },
  { key: 'return_6m_pct', label: 'Retorno 6 meses', block: 'retorno', unit: 'pct', direction: 'higher', decimals: 2 },
  { key: 'return_1y_pct', label: 'Retorno 1 ano', block: 'retorno', unit: 'pct', direction: 'higher', decimals: 2 },
  { key: 'return_ytd_pct', label: 'Retorno no ano', block: 'retorno', unit: 'pct', direction: 'higher', decimals: 2 },

  // Risco — menor é melhor.
  {
    key: 'beta_5y',
    label: 'Beta 5 anos',
    block: 'risco',
    unit: 'x',
    direction: 'lower',
    decimals: 2,
    hint: 'Sensibilidade ao Ibovespa. Abaixo de 1 = menos volátil que o índice.',
  },
  {
    key: 'volatility_1y_pct',
    label: 'Volatilidade 1 ano',
    block: 'risco',
    unit: 'pct',
    direction: 'lower',
    decimals: 1,
  },

  // Liquidez — maior é melhor.
  {
    key: 'avg_quarterly_volume_brl_thousands',
    label: 'Volume médio trimestral',
    block: 'liquidez',
    unit: 'brlThousands',
    direction: 'higher',
    decimals: 0,
    hint: 'Giro financeiro médio por trimestre nos últimos 12 meses.',
  },
  {
    key: 'close_price_brl',
    label: 'Cotação',
    block: 'liquidez',
    unit: 'brl',
    direction: 'neutral',
    decimals: 2,
  },
]

export const BLOCK_LABELS: Record<MetricBlock, string> = {
  tamanho: 'Tamanho',
  valuation: 'Valuation',
  rentabilidade: 'Rentabilidade',
  alavancagem: 'Alavancagem',
  retorno: 'Retorno ao acionista',
  risco: 'Risco',
  liquidez: 'Liquidez',
}

export const BLOCK_ORDER: MetricBlock[] = [
  'tamanho',
  'valuation',
  'rentabilidade',
  'alavancagem',
  'retorno',
  'risco',
  'liquidez',
]

const BY_KEY = new Map(METRICS.map((m) => [m.key, m]))

export const metricByKey = (key: MetricKey): MetricDef | undefined => BY_KEY.get(key)

export const metricsOfBlock = (block: MetricBlock): MetricDef[] => METRICS.filter((m) => m.block === block)

/** Métricas oferecidas no seletor da aba de histórico. */
export const HISTORY_METRICS: MetricKey[] = [
  'roe_ltm_pct',
  'roic_ltm_pct',
  'ebitda_margin_ltm_pct',
  'net_margin_ltm_pct',
  'pe_ltm',
  'ev_ebitda_ltm',
  'net_debt_ebitda_ltm',
  'dividend_yield_ltm_pct',
]
