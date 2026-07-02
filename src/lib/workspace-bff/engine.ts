import { localLibraryObjects } from './catalog';
import type { ActivationProfile, LibraryRecommendation, LibraryRecommendationParams, LibraryRecommendationResponse } from './types';

const RECOMMENDATION_VERSION = 'workspace-library-rules-v1';

function nowIso() {
  return new Date().toISOString();
}

function technicalLevelFor(role: string, preferredChannel: string): 'baixo' | 'medio' | 'alto' {
  if (['Desenvolvedor / Engenharia', 'Head de Tecnologia', 'Quant'].includes(role)) return 'alto';
  if (['API', 'API sandbox', 'Data Feed'].includes(preferredChannel)) return 'alto';
  if (['MCP', 'Terminal'].includes(preferredChannel)) return 'medio';
  return 'baixo';
}

function routeFor(role: string, preferredChannel: string) {
  if (role === 'Assessor de Investimentos' || role === 'AAI') return 'MCP ChatGPT + Biblioteca AAI';
  if (['Desenvolvedor / Engenharia', 'Head de Tecnologia', 'Quant'].includes(role)) return 'API sandbox + Biblioteca técnica';
  if (role === 'Trader') return 'Terminal + Notícias e eventos do dia';
  if (role === 'Gestor' || role === 'Portfolio Manager') return 'Plataforma + Terminal + Carteira';
  if (preferredChannel === 'API' || preferredChannel === 'API sandbox') return 'API sandbox + revisão técnica';
  if (preferredChannel === 'MCP') return 'MCP + Biblioteca por perfil';
  return 'Biblioteca por perfil + produtos contratados';
}

export function buildLocalActivationProfile(params: LibraryRecommendationParams = {}): ActivationProfile {
  const role = params.role ?? 'Cliente atual sem preferência declarada';
  const preferredChannel = params.preferredChannel ?? 'Biblioteca';
  const hasOnboarding = Boolean(params.role || params.preferredChannel || params.preferredProduct);
  const mode = hasOnboarding ? 'onboarding_guided' : 'customer_without_onboarding';
  const observedObjectIds = params.observedObjectIds ?? [];

  return {
    userId: 'demo-user',
    organizationId: 'demo-organization',
    hasOnboarding,
    source: hasOnboarding ? 'declared' : 'inferred_from_account',
    declared: hasOnboarding ? { role: params.role, preferredChannel, preferredProduct: params.preferredProduct } : null,
    inferred: {
      role,
      segment: params.isCurrentCustomer === false ? 'Lead novo' : 'Cliente Economatica',
      usageType: 'USO_INTERNO',
      preferredChannel,
      preferredProduct: params.preferredProduct ?? null,
      bases: ['Fundamentos', 'Notícias', 'Calendário'],
      markets: ['Brasil'],
      technicalLevel: technicalLevelFor(role, preferredChannel),
      isCurrentCustomer: params.isCurrentCustomer ?? true,
      contractedProducts: ['Plataforma Economatica', 'Terminal Economatica'],
      redistributionRisk: 'baixo',
    },
    observed: {
      totalEvents: observedObjectIds.length,
      usedChannels: [],
      openedObjects: observedObjectIds,
      lastEventAt: null,
    },
    recommendedProfile: role,
    recommendationMode: mode,
    recommendedRoute: routeFor(role, preferredChannel),
    preferenceCta: hasOnboarding ? 'Atualizar preferências' : 'Personalize suas recomendações em menos de 1 minuto',
    updatedAt: nowIso(),
  };
}

function reasonFor(objectProfiles: string[], profile: ActivationProfile) {
  const role = profile.inferred.role;
  if (objectProfiles.includes(role)) return `Recomendado para ${role}`;
  if (profile.recommendationMode === 'customer_without_onboarding') return 'Recomendado a partir dos produtos e permissões já conhecidos da conta';
  return 'Recomendado por proximidade com o canal e objetivo selecionados';
}

export function recommendLocalObjects(profile: ActivationProfile, limit = 4): LibraryRecommendation[] {
  const role = profile.inferred.role;
  const preferredChannel = profile.inferred.preferredChannel;
  const observedObjectIds = profile.observed.openedObjects;

  return localLibraryObjects
    .map((object) => {
      let score = 0;
      if (object.profiles.includes(role)) score += 100;
      if ((role === 'Assessor de Investimentos' || role === 'AAI') && object.profiles.includes('AAI')) score += 80;
      if (object.channels.some((channel) => channel.toLowerCase().includes(preferredChannel.toLowerCase()))) score += 40;
      if (observedObjectIds.includes(object.id)) score -= 30;
      score += Math.max(0, 20 - object.priority);
      return { object, score };
    })
    .sort((a, b) => b.score - a.score || a.object.priority - b.object.priority)
    .slice(0, limit)
    .map(({ object, score }, index) => ({
      ...object,
      recommendationRank: index + 1,
      recommendationScore: score,
      recommendationReason: reasonFor(object.profiles, profile),
    }));
}

export function buildLocalRecommendationResponse(params: LibraryRecommendationParams = {}): LibraryRecommendationResponse {
  const activationProfile = buildLocalActivationProfile(params);
  const recommendedObjects = recommendLocalObjects(activationProfile);
  const hasApiInterest = activationProfile.inferred.preferredChannel === 'API' || activationProfile.inferred.preferredChannel === 'API sandbox';
  return {
    activationProfile,
    recommendedObjects,
    firstAction: recommendedObjects[0]?.firstAction ?? 'Abrir Biblioteca por perfil',
    commercialSignals: [
      ...(hasApiInterest ? [{ type: 'api_interest', severity: 'medium' as const, label: 'Interesse técnico em API sandbox' }] : []),
      ...(activationProfile.recommendationMode === 'customer_without_onboarding'
        ? [{ type: 'missing_preferences', severity: 'low' as const, label: 'Cliente atual sem preferências declaradas' }]
        : []),
    ],
    recommendationVersion: RECOMMENDATION_VERSION,
    generatedAt: nowIso(),
    source: 'local-fallback',
  };
}
