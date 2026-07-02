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

export const defaultDeclaredProfile: DeclaredProfile = {
  role: 'Assessor de Investimentos',
  institution: 'Fintech',
  country: 'Brasil',
  state: 'SP',
  employees: '51 a 200',
  usageType: 'B2B2C',
  clientCompaniesMonth1: '6 a 20',
  clientCompaniesYear1: '21 a 100',
  endUsersMonth1: '1.001 a 10.000',
  endUsersYear1: '10.000+',
  accessModel: 'Área logada',
  commercialModel: 'Pago',
  payer: 'Empresas clientes',
  projectDescription: 'Área logada para clientes acompanharem dados e análises com IA usando notícias, fundamentos e renda fixa.',
  deliverySurfaces: ['Área logada', 'Dashboard', 'Chatbot'],
  redistribution: 'Sim, dados derivados',
  exportNeeds: 'API',
  bases: ['Notícias', 'Fundamentos', 'Renda Fixa'],
  markets: ['Brasil', 'Estados Unidos'],
  channels: ['MCP', 'API', 'Data Feed'],
  objectives: ['Quantitative trading', 'Renda fixa', 'Análise de crédito', 'Dados e integração'],
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

/** Canal preferido para o filtro de recomendação: primeiro canal técnico marcado. */
export function preferredChannelOf(profile: DeclaredProfile) {
  return profile.channels[0] ?? 'Workspace'
}

/** Mesma lógica do protótipo: rota sugerida e risco derivados do tipo de uso. */
export function accessRouteFor(usageType: QualificationUsageType) {
  if (usageType === 'USO_INTERNO') return 'MCP + Terminal + Biblioteca por perfil'
  if (usageType === 'B2B') return 'MCP + API sandbox + avaliação comercial'
  if (usageType === 'B2C') return 'MCP + API sandbox + revisão de redistribuição'
  return 'MCP + API sandbox + avaliação técnica e comercial'
}

export function accessRiskFor(usageType: QualificationUsageType) {
  if (usageType === 'USO_INTERNO') return 'Baixo'
  if (usageType === 'B2B') return 'Médio'
  return 'Alto'
}
