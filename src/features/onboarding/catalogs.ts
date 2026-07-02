/**
 * Catálogos canônicos da qualificação do primeiro acesso — mesmos campos e
 * opções do protótipo (economatica/economatica-workspace), pensados para
 * alimentar CRM, PQL, entitlement, pricing e risco de redistribuição.
 */

export type QualificationUsageType = 'USO_INTERNO' | 'B2B' | 'B2C' | 'B2B2C'

export const qualificationSegments = [
  'Agente Autônomo de Investimento (AAI)', 'Banco', 'Casa de Análise', 'Comunidade',
  'Consultoria', 'Corretora', 'Family office', 'Fintech',
  'Fundação de Previdência Estadual e Municipal', 'Fundação de Previdência Privada',
  'Fundo de Investimento', 'Gestora de Fundos', 'Instituição de Ensino Privada',
  'Instituição de Ensino Pública', 'Investidor Particular', 'Jornalismo', 'M&A',
  'MFO', 'Private Bank / Wealth management', 'RI', 'Universidade/Professores', 'Outros',
]

export const qualificationCountries = ['Brasil', 'Argentina', 'Chile', 'Colômbia', 'México', 'Peru', 'Estados Unidos', 'Outro']

export const qualificationStates = ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'DF', 'Outro']

export const qualificationBases = ['Notícias', 'Fundamentos', 'Fundos', 'FIIs', 'Renda Fixa']

export const qualificationDataMarkets = ['Brasil', 'Argentina', 'Chile', 'Peru', 'Colômbia', 'México', 'Estados Unidos']

export const qualificationRoles = ['Analista buy-side', 'Analista de Dados', 'Analista sell-side', 'Assessor de Investimentos', 'CEO / Fundador', 'CFO', 'COO', 'Comercial', 'Consultor', 'Desenvolvedor / Engenharia', 'Estudante', 'Gestor', 'Head de Produto', 'Head de Tecnologia', 'Outros', 'Portfolio Manager', 'Professor / Pesquisador', 'Quant', 'RI', 'Sócio / Diretor', 'Trader']

export const qualificationUsageTypes: Array<{ value: QualificationUsageType; label: string; description: string }> = [
  { value: 'USO_INTERNO', label: 'Uso interno', description: 'Uso dentro da própria organização.' },
  { value: 'B2B', label: 'B2B', description: 'Produto ou serviço para empresas clientes.' },
  { value: 'B2C', label: 'B2C', description: 'Produto ou serviço para usuários finais.' },
  { value: 'B2B2C', label: 'B2B2C', description: 'Sua organização atende empresas que atendem usuários finais.' },
]

export const qualificationUserRanges = ['1 a 10', '11 a 50', '51 a 200', '201 a 1.000', '1.001 a 10.000', '10.000+', 'Não definido']

export const qualificationCompanyRanges = ['1 a 5', '6 a 20', '21 a 100', '101 a 500', '500+', 'Não definido']

export const qualificationEmployeeRanges = ['1 a 10', '11 a 50', '51 a 200', '201 a 1.000', '1.001 a 5.000', '5.000+', 'Não definido']

export const qualificationAccessModels = ['Interno', 'Área aberta', 'Área logada', 'Misto', 'Não definido']

export const qualificationCommercialModels = ['Interno sem cobrança', 'Pago', 'Gratuito', 'Freemium', 'Não definido']

export const qualificationPayers = ['Sua organização', 'Empresas clientes', 'Usuário final', 'Patrocinador/anunciante', 'Misto', 'Não definido']

export const qualificationDeliverySurfaces = ['Workspace interno', 'App', 'Site aberto', 'Área logada', 'Newsletter', 'Relatório', 'Dashboard', 'Chatbot', 'API própria', 'Planilha', 'Outro']

export const qualificationRedistribution = ['Não', 'Sim, dados agregados', 'Sim, dados derivados', 'Sim, dados brutos', 'Não definido']

export const qualificationExportNeeds = ['Não', 'CSV/Excel', 'API', 'PDF/relatório', 'Dashboard', 'Não definido']

export const qualificationChannels = ['Workspace', 'MCP', 'API', 'Excel', 'Terminal', 'Data Feed', 'Bedrock', 'Copilot', 'Outro']

export const qualificationObjectives = ['Research e mercado', 'Quantitative trading', 'Monitoramento de notícias', 'Renda fixa', 'Análise de crédito', 'Fundos e alocação', 'Dados e integração', 'Automação interna', 'Produto digital', 'Relações com investidores', 'Educação e conteúdo', 'Outro']
