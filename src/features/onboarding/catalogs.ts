/**
 * Catálogos canônicos da qualificação do primeiro acesso — contrato
 * workspace-onboarding-v1 (ECO2025-1922). Espelho exato do catálogo da
 * Central (lib/workspace/catalogs.ts): as respostas são armazenadas e
 * trafegam por CÓDIGO (slug estável); os labels PT existem só na
 * renderização. Mudança aqui exige a mesma mudança na Central.
 */

export interface CatalogOption {
  code: string
  label: string
}

export type QualificationUsageType = 'uso-interno' | 'b2b' | 'b2c' | 'b2b2c'

export const qualificationRoles: CatalogOption[] = [
  { code: 'analista-buy-side', label: 'Analista buy-side' },
  { code: 'analista-de-dados', label: 'Analista de Dados' },
  { code: 'analista-sell-side', label: 'Analista sell-side' },
  { code: 'assessor-de-investimentos', label: 'Assessor de Investimentos' },
  { code: 'ceo-fundador', label: 'CEO / Fundador' },
  { code: 'cfo', label: 'CFO' },
  { code: 'coo', label: 'COO' },
  { code: 'comercial', label: 'Comercial' },
  { code: 'consultor', label: 'Consultor' },
  { code: 'desenvolvedor-engenharia', label: 'Desenvolvedor / Engenharia' },
  { code: 'estudante', label: 'Estudante' },
  { code: 'gestor', label: 'Gestor' },
  { code: 'head-de-produto', label: 'Head de Produto' },
  { code: 'head-de-tecnologia', label: 'Head de Tecnologia' },
  { code: 'outros', label: 'Outros' },
  { code: 'portfolio-manager', label: 'Portfolio Manager' },
  { code: 'professor-pesquisador', label: 'Professor / Pesquisador' },
  { code: 'quant', label: 'Quant' },
  { code: 'ri', label: 'RI' },
  { code: 'socio-diretor', label: 'Sócio / Diretor' },
  { code: 'trader', label: 'Trader' },
]

export const qualificationSegments: CatalogOption[] = [
  { code: 'aai', label: 'Agente Autônomo de Investimento (AAI)' },
  { code: 'banco', label: 'Banco' },
  { code: 'casa-de-analise', label: 'Casa de Análise' },
  { code: 'comunidade', label: 'Comunidade' },
  { code: 'consultoria', label: 'Consultoria' },
  { code: 'corretora', label: 'Corretora' },
  { code: 'family-office', label: 'Family office' },
  { code: 'fintech', label: 'Fintech' },
  { code: 'fundacao-previdencia-estadual-municipal', label: 'Fundação de Previdência Estadual e Municipal' },
  { code: 'fundacao-previdencia-privada', label: 'Fundação de Previdência Privada' },
  { code: 'fundo-de-investimento', label: 'Fundo de Investimento' },
  { code: 'gestora-de-fundos', label: 'Gestora de Fundos' },
  { code: 'ensino-privada', label: 'Instituição de Ensino Privada' },
  { code: 'ensino-publica', label: 'Instituição de Ensino Pública' },
  { code: 'investidor-particular', label: 'Investidor Particular' },
  { code: 'jornalismo', label: 'Jornalismo' },
  { code: 'ma', label: 'M&A' },
  { code: 'mfo', label: 'MFO' },
  { code: 'private-bank-wealth', label: 'Private Bank / Wealth management' },
  { code: 'ri', label: 'RI' },
  { code: 'universidade-professores', label: 'Universidade/Professores' },
  { code: 'outros', label: 'Outros' },
]

export const qualificationCountries: CatalogOption[] = [
  { code: 'brasil', label: 'Brasil' },
  { code: 'argentina', label: 'Argentina' },
  { code: 'chile', label: 'Chile' },
  { code: 'colombia', label: 'Colômbia' },
  { code: 'mexico', label: 'México' },
  { code: 'peru', label: 'Peru' },
  { code: 'estados-unidos', label: 'Estados Unidos' },
  { code: 'outro', label: 'Outro' },
]

export const qualificationStates: CatalogOption[] = [
  { code: 'sp', label: 'SP' },
  { code: 'rj', label: 'RJ' },
  { code: 'mg', label: 'MG' },
  { code: 'rs', label: 'RS' },
  { code: 'pr', label: 'PR' },
  { code: 'sc', label: 'SC' },
  { code: 'ba', label: 'BA' },
  { code: 'df', label: 'DF' },
  { code: 'outro', label: 'Outro' },
]

export const qualificationEmployeeRanges: CatalogOption[] = [
  { code: '1-10', label: '1 a 10' },
  { code: '11-50', label: '11 a 50' },
  { code: '51-200', label: '51 a 200' },
  { code: '201-1000', label: '201 a 1.000' },
  { code: '1001-5000', label: '1.001 a 5.000' },
  { code: '5000-plus', label: '5.000+' },
  { code: 'nao-definido', label: 'Não definido' },
]

export const qualificationUsageTypes: Array<CatalogOption & { code: QualificationUsageType; description: string }> = [
  { code: 'uso-interno', label: 'Uso interno', description: 'Uso dentro da própria organização.' },
  { code: 'b2b', label: 'B2B', description: 'Produto ou serviço para empresas clientes.' },
  { code: 'b2c', label: 'B2C', description: 'Produto ou serviço para usuários finais.' },
  { code: 'b2b2c', label: 'B2B2C', description: 'Sua organização atende empresas que atendem usuários finais.' },
]

export const qualificationCompanyRanges: CatalogOption[] = [
  { code: '1-5', label: '1 a 5' },
  { code: '6-20', label: '6 a 20' },
  { code: '21-100', label: '21 a 100' },
  { code: '101-500', label: '101 a 500' },
  { code: '500-plus', label: '500+' },
  { code: 'nao-definido', label: 'Não definido' },
]

export const qualificationUserRanges: CatalogOption[] = [
  { code: '1-10', label: '1 a 10' },
  { code: '11-50', label: '11 a 50' },
  { code: '51-200', label: '51 a 200' },
  { code: '201-1000', label: '201 a 1.000' },
  { code: '1001-10000', label: '1.001 a 10.000' },
  { code: '10000-plus', label: '10.000+' },
  { code: 'nao-definido', label: 'Não definido' },
]

export const qualificationAccessModels: CatalogOption[] = [
  { code: 'interno', label: 'Interno' },
  { code: 'area-aberta', label: 'Área aberta' },
  { code: 'area-logada', label: 'Área logada' },
  { code: 'misto', label: 'Misto' },
  { code: 'nao-definido', label: 'Não definido' },
]

export const qualificationCommercialModels: CatalogOption[] = [
  { code: 'interno-sem-cobranca', label: 'Interno sem cobrança' },
  { code: 'pago', label: 'Pago' },
  { code: 'gratuito', label: 'Gratuito' },
  { code: 'freemium', label: 'Freemium' },
  { code: 'nao-definido', label: 'Não definido' },
]

export const qualificationPayers: CatalogOption[] = [
  { code: 'propria-organizacao', label: 'Sua organização' },
  { code: 'empresas-clientes', label: 'Empresas clientes' },
  { code: 'usuario-final', label: 'Usuário final' },
  { code: 'patrocinador-anunciante', label: 'Patrocinador/anunciante' },
  { code: 'misto', label: 'Misto' },
  { code: 'nao-definido', label: 'Não definido' },
]

export const qualificationDeliverySurfaces: CatalogOption[] = [
  { code: 'workspace-interno', label: 'Workspace interno' },
  { code: 'app', label: 'App' },
  { code: 'site-aberto', label: 'Site aberto' },
  { code: 'area-logada', label: 'Área logada' },
  { code: 'newsletter', label: 'Newsletter' },
  { code: 'relatorio', label: 'Relatório' },
  { code: 'dashboard', label: 'Dashboard' },
  { code: 'chatbot', label: 'Chatbot' },
  { code: 'api-propria', label: 'API própria' },
  { code: 'planilha', label: 'Planilha' },
  { code: 'outro', label: 'Outro' },
]

export const qualificationRedistribution: CatalogOption[] = [
  { code: 'nao', label: 'Não' },
  { code: 'sim-agregados', label: 'Sim, dados agregados' },
  { code: 'sim-derivados', label: 'Sim, dados derivados' },
  { code: 'sim-brutos', label: 'Sim, dados brutos' },
  { code: 'nao-definido', label: 'Não definido' },
]

export const qualificationExportNeeds: CatalogOption[] = [
  { code: 'nao', label: 'Não' },
  { code: 'csv-excel', label: 'CSV/Excel' },
  { code: 'api', label: 'API' },
  { code: 'pdf-relatorio', label: 'PDF/relatório' },
  { code: 'dashboard', label: 'Dashboard' },
  { code: 'nao-definido', label: 'Não definido' },
]

export const qualificationBases: CatalogOption[] = [
  { code: 'noticias', label: 'Notícias' },
  { code: 'fundamentos', label: 'Fundamentos' },
  { code: 'fundos', label: 'Fundos' },
  { code: 'fiis', label: 'FIIs' },
  { code: 'renda-fixa', label: 'Renda Fixa' },
]

export const qualificationDataMarkets: CatalogOption[] = [
  { code: 'brasil', label: 'Brasil' },
  { code: 'argentina', label: 'Argentina' },
  { code: 'chile', label: 'Chile' },
  { code: 'peru', label: 'Peru' },
  { code: 'colombia', label: 'Colômbia' },
  { code: 'mexico', label: 'México' },
  { code: 'estados-unidos', label: 'Estados Unidos' },
]

export const qualificationChannels: CatalogOption[] = [
  { code: 'workspace', label: 'Workspace' },
  { code: 'mcp', label: 'MCP' },
  { code: 'api', label: 'API' },
  { code: 'excel', label: 'Excel' },
  { code: 'terminal', label: 'Terminal' },
  { code: 'data-feed', label: 'Data Feed' },
  { code: 'bedrock', label: 'Bedrock' },
  { code: 'copilot', label: 'Copilot' },
  { code: 'outro', label: 'Outro' },
]

export const qualificationObjectives: CatalogOption[] = [
  { code: 'research-mercado', label: 'Research e mercado' },
  { code: 'quantitative-trading', label: 'Quantitative trading' },
  { code: 'monitoramento-noticias', label: 'Monitoramento de notícias' },
  { code: 'renda-fixa', label: 'Renda fixa' },
  { code: 'analise-credito', label: 'Análise de crédito' },
  { code: 'fundos-alocacao', label: 'Fundos e alocação' },
  { code: 'dados-integracao', label: 'Dados e integração' },
  { code: 'automacao-interna', label: 'Automação interna' },
  { code: 'produto-digital', label: 'Produto digital' },
  { code: 'ri', label: 'Relações com investidores' },
  { code: 'educacao-conteudo', label: 'Educação e conteúdo' },
  { code: 'outro', label: 'Outro' },
]

/** Label de um código dentro de um catálogo (cai no próprio código se não achar). */
export function labelFor(catalog: CatalogOption[], code: string | null | undefined): string {
  if (!code) return ''
  return catalog.find((option) => option.code === code)?.label ?? code
}
