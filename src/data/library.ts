import artifact1 from '@/assets/artifact-1.png'
import artifact2 from '@/assets/artifact-2.png'

export interface LibraryPrompt {
  tags: string[]
  title: string
  description: string
  prompt: string
}

/** Prompts da Biblioteca — os 6 primeiros aparecem também no Kento MCP. */
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
  {
    tags: ['Prompt'],
    title: 'Tese de investimento em 1 página',
    description: 'Estrutura uma tese resumida com drivers, riscos e gatilhos de reavaliação.',
    prompt: 'Monte uma tese de investimento de 1 página para WEGE3 com drivers, riscos e valuation.',
  },
  {
    tags: ['Prompt', 'Workflow'],
    title: 'Monitor de dividendos',
    description: 'Acompanha proventos anunciados e projeta o fluxo de recebimentos da carteira.',
    prompt: 'Liste os próximos dividendos anunciados das ações da minha carteira e o yield projetado.',
  },
  {
    tags: ['Prompt'],
    title: 'Debêntures em atenção',
    description: 'Radar de crédito privado: emissores com piora recente de notícias e prêmio acima do CDI.',
    prompt: 'Liste debêntures de emissores com piora recente de notícias e prêmio acima do CDI, com emissor, vencimento, duration, garantia e risco.',
  },
  {
    tags: ['Prompt', 'Workflow'],
    title: 'Fundos com sobreposição',
    description: 'Compara fundos por performance, risco e sobreposição de carteira antes de alocar.',
    prompt: 'Compare estes fundos por performance, risco, drawdown e sobreposição de carteira, destacando concentração e liquidez.',
  },
  {
    tags: ['Prompt'],
    title: 'Prévia de resultado',
    description: 'What to watch antes do balanço: consenso, histórico recente, sentimento e riscos.',
    prompt: 'Prepare uma prévia de resultado para a empresa, com o que observar, consenso quando disponível, histórico recente, sentimento e riscos principais.',
  },
]

export interface LibrarySkill {
  category: string
  name: string
  description: string
}

/** Skills instaláveis — nomes em kebab-case como no comp. */
export const librarySkills: LibrarySkill[] = [
  {
    category: 'Rotina e cobertura',
    name: 'morning-note',
    description: 'Morning note diária com overnight US/Ásia, fatos relevantes, agenda do dia e temas em foco.',
  },
  {
    category: 'Rotina e cobertura',
    name: 'catalyst-calendar',
    description: 'Agenda de earnings, COPOM, eventos corporativos, calls e datas que movem cobertura.',
  },
  {
    category: 'Rotina e cobertura',
    name: 'sector-overview',
    description: 'Panorama BR por setor com pares, múltiplos, fundamentos e sentimento.',
  },
  {
    category: 'Análise e valuation',
    name: 'earnings-recap',
    description: 'Resumo pós-resultado com destaques versus consenso e reação do sell-side.',
  },
  {
    category: 'Análise e valuation',
    name: 'peer-valuation',
    description: 'Comparação de múltiplos entre pares com histórico e prêmio/desconto.',
  },
  {
    category: 'Monitoramento',
    name: 'portfolio-x-ray',
    description: 'Raio-X da carteira: concentração, fatores, liquidez e eventos por posição.',
  },
  {
    category: 'Monitoramento',
    name: 'dividend-tracker',
    description: 'Acompanhamento de proventos anunciados e projeção de fluxo por ativo.',
  },
  {
    category: 'Rotina e cobertura',
    name: 'macro-briefing',
    description: 'Briefing macro com Selic, IPCA, câmbio e agenda da semana em 5 minutos.',
  },
  {
    category: 'Rotina e cobertura',
    name: 'thesis-tracker',
    description: 'Acompanha uma tese com notícias, tendência de sentimento e eventos relevantes.',
  },
  {
    category: 'Análise e valuation',
    name: 'earnings-preview',
    description: 'What to watch antes do resultado, com consenso quando disponível e histórico recente.',
  },
  {
    category: 'Análise e valuation',
    name: 'fundamental-snapshot',
    description: 'Resumo fundamentalista de uma ação com indicadores, balanço, retornos e liquidez.',
  },
]

export interface LibraryArtifact {
  title: string
  description: string
  prompt: string
  image: string
}

/** Artefatos em alta — previews com o prompt gerador. */
export const libraryArtifacts: LibraryArtifact[] = [
  {
    title: 'Screener de ideias B3',
    description: 'Filtro fundamentalista com sentimento, liquidez, valuation e ranking de ideias.',
    prompt: 'Crie um artefato HTML self-contained em PT-BR com screener de ações B3 usando fundamentos, liquidez, valuation e sentimento.',
    image: artifact1,
  },
  {
    title: 'Radar institucional de fundos',
    description: 'Página de fundos com comparador sobre o universo CVM e métricas diárias.',
    prompt: 'Crie um artefato HTML self-contained em PT-BR com radar de fundos CVM, filtros por classe e comparador.',
    image: artifact2,
  },
  {
    title: 'Monitor de fundos',
    description: 'Explorador do universo CVM com retorno, classe e busca por gestor ou CNPJ.',
    prompt: 'Crie um artefato HTML self-contained em PT-BR com monitor de fundos por classe, retorno 12m e busca por CNPJ.',
    image: artifact2,
  },
  {
    title: 'Heatmap setorial B3',
    description: 'Mapa de calor por setor com variação, volume e destaques do dia.',
    prompt: 'Crie um artefato HTML self-contained em PT-BR com heatmap setorial da B3 por variação e volume.',
    image: artifact1,
  },
  {
    title: 'Painel de dividendos',
    description: 'Agenda de proventos com yield projetado e histórico por ativo.',
    prompt: 'Crie um artefato HTML self-contained em PT-BR com painel de dividendos anunciados e yield projetado.',
    image: artifact2,
  },
  {
    title: 'Comparador de pares',
    description: 'Múltiplos, margens e crescimento lado a lado para o setor escolhido.',
    prompt: 'Crie um artefato HTML self-contained em PT-BR comparando múltiplos e margens de pares do mesmo setor.',
    image: artifact1,
  },
  {
    title: 'Monitor de earnings',
    description: 'Calendário de resultados com consenso, surpresa e reação do mercado.',
    prompt: 'Crie um artefato HTML self-contained em PT-BR com monitor de earnings da B3 e surpresas vs consenso.',
    image: artifact2,
  },
  {
    title: 'Dashboard macro Brasil',
    description: 'Selic, IPCA, câmbio e atividade em um painel único e atualizado.',
    prompt: 'Crie um artefato HTML self-contained em PT-BR com dashboard macro do Brasil (juros, inflação, câmbio).',
    image: artifact1,
  },
  {
    title: 'Backtest de carteira',
    description: 'Carteira vs IBOV e CDI com retorno, volatilidade, drawdown, Sharpe e contribuição por ativo.',
    prompt: 'Monte um painel de backtest da carteira contra IBOV e CDI, com base 100, cards de métricas e tabela de contribuição.',
    image: artifact2,
  },
  {
    title: 'Otimizador de carteira',
    description: 'Otimização de carteira com restrições por ativo, risco, retorno esperado e benchmark.',
    prompt: 'Crie um otimizador de carteira com restrições por ativo, comparação contra benchmark e fronteira eficiente.',
    image: artifact1,
  },
  {
    title: 'Screener de notícias',
    description: 'Sentimento, urgência, relevância, clusters e tickers mais citados no noticiário.',
    prompt: 'Mostre distribuição de sentimento, urgência e clusters de notícias dos tickers monitorados nos últimos 30 dias.',
    image: artifact2,
  },
]

export interface LibraryTool {
  category: string
  name: string
  description: string
  prompt: string
  required: string
}

/** Ferramentas de dados do conector MCP — mesmo catálogo do protótipo. */
export const libraryTools: LibraryTool[] = [
  {
    category: 'Notícias',
    name: 'news_search',
    description: 'Busca notícias por ticker, setor, fonte, período ou texto livre.',
    prompt: 'Quais notícias da Petrobras na última semana sobre dividendos?',
    required: 'Notícias',
  },
  {
    category: 'Notícias',
    name: 'news_sentiment_overview',
    description: 'Resume sentimento positivo, neutro e negativo por ticker, fonte ou tema.',
    prompt: 'Como está o sentimento de PETR4 vs PRIO3 nos últimos 30 dias?',
    required: 'Notícias',
  },
  {
    category: 'Calendário',
    name: 'calendar_search',
    description: 'Calendário econômico e corporativo, incluindo earnings, COPOM, IPCA, Fed, CPI e NFP.',
    prompt: 'Quais resultados saem essa semana? E o próximo COPOM?',
    required: 'Calendário',
  },
  {
    category: 'IR',
    name: 'news_ir_transcripts_search',
    description: 'Busca trechos verbatim em calls de resultado com locutor e seção.',
    prompt: 'O que o CFO da Vale falou sobre capex no 1T26?',
    required: 'IR, Notícias',
  },
  {
    category: 'Ações',
    name: 'stocks_snapshot',
    description: 'Snapshot fundamentalista, múltiplos, retornos, risco, momentum e liquidez.',
    prompt: 'Mostre o snapshot fundamentalista de ITUB4.',
    required: 'Ações',
  },
  {
    category: 'Carteira',
    name: 'portfolio_backtest',
    description: 'Backtest de carteira contra benchmarks, com métricas e contribuição por ativo.',
    prompt: 'Faça backtest desta carteira contra IBOV e CDI.',
    required: 'Ações, Benchmarks',
  },
  {
    category: 'Fundos',
    name: 'funds_compare',
    description: 'Compara fundos por performance, risco, carteira e sobreposição.',
    prompt: 'Compare estes fundos por retorno, risco e sobreposição.',
    required: 'Fundos',
  },
  {
    category: 'Crédito',
    name: 'credit_issuer_risk',
    description: 'Cruza balanço, emissões, notícias, covenants e risco do emissor.',
    prompt: 'Quais emissores tiveram piora de risco e notícias negativas?',
    required: 'Crédito, Debêntures',
  },
]
