import type { QualificationUsageType } from './catalogs'

/**
 * Perfil declarado no primeiro acesso. Mock em memória, de propósito:
 * todo acesso ao link passa pelo onboarding de novo (sem persistência),
 * e as respostas alimentam o filtro de recomendação da Biblioteca na
 * sessão corrente. No produto real este payload vai para o BFF
 * (POST /userbffapi/v4/workspace/onboarding).
 */
export interface DeclaredProfile {
  role: string
  institution: string
  country: string
  state: string
  employees: string
  usageType: QualificationUsageType
  clientCompaniesMonth1: string
  clientCompaniesYear1: string
  endUsersMonth1: string
  endUsersYear1: string
  accessModel: string
  commercialModel: string
  payer: string
  projectDescription: string
  deliverySurfaces: string[]
  redistribution: string
  exportNeeds: string
  bases: string[]
  markets: string[]
  channels: string[]
  objectives: string[]
}

// Defaults em CÓDIGOS canônicos (contrato workspace-onboarding-v1).
export const defaultDeclaredProfile: DeclaredProfile = {
  role: 'assessor-de-investimentos',
  institution: 'fintech',
  country: 'brasil',
  state: 'sp',
  employees: '51-200',
  usageType: 'b2b2c',
  clientCompaniesMonth1: '6-20',
  clientCompaniesYear1: '21-100',
  endUsersMonth1: '1001-10000',
  endUsersYear1: '10000-plus',
  accessModel: 'area-logada',
  commercialModel: 'pago',
  payer: 'empresas-clientes',
  projectDescription: 'Área logada para clientes acompanharem dados e análises com IA usando notícias, fundamentos e renda fixa.',
  deliverySurfaces: ['area-logada', 'dashboard', 'chatbot'],
  redistribution: 'sim-derivados',
  exportNeeds: 'api',
  bases: ['noticias', 'fundamentos', 'renda-fixa'],
  markets: ['brasil', 'estados-unidos'],
  channels: ['mcp', 'api', 'data-feed'],
  objectives: ['quantitative-trading', 'renda-fixa', 'analise-credito', 'dados-integracao'],
}

let declaredProfile: DeclaredProfile = { ...defaultDeclaredProfile }
let onboardingComplete = false

export function isOnboardingComplete() {
  return onboardingComplete
}

export function completeOnboarding(profile: DeclaredProfile) {
  declaredProfile = profile
  onboardingComplete = true
}

export function getDeclaredProfile(): DeclaredProfile {
  return declaredProfile
}

/** Canal preferido (código) para o filtro de recomendação: primeiro canal marcado. */
export function preferredChannelOf(profile: DeclaredProfile) {
  return profile.channels[0] ?? 'workspace'
}

/** Mesma lógica do protótipo: rota sugerida e risco derivados do tipo de uso. */
export function accessRouteFor(usageType: QualificationUsageType) {
  if (usageType === 'uso-interno') return 'MCP + Terminal + Biblioteca por perfil'
  if (usageType === 'b2b') return 'MCP + API sandbox + avaliação comercial'
  if (usageType === 'b2c') return 'MCP + API sandbox + revisão de redistribuição'
  return 'MCP + API sandbox + avaliação técnica e comercial'
}

export function accessRiskFor(usageType: QualificationUsageType) {
  if (usageType === 'uso-interno') return 'Baixo'
  if (usageType === 'b2b') return 'Médio'
  return 'Alto'
}
