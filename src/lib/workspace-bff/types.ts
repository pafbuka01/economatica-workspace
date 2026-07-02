export type RecommendationMode = 'onboarding_guided' | 'customer_without_onboarding' | 'behavior_adjusted';

export type ActivationProfile = {
  userId: string;
  organizationId: string;
  hasOnboarding: boolean;
  source: 'declared' | 'inferred_from_account' | 'observed_behavior';
  declared: Record<string, unknown> | null;
  inferred: {
    role: string;
    segment: string;
    usageType: string;
    preferredChannel: string;
    preferredProduct: string | null;
    bases: string[];
    markets: string[];
    technicalLevel: 'baixo' | 'medio' | 'alto';
    isCurrentCustomer: boolean;
    contractedProducts: string[];
    redistributionRisk: 'baixo' | 'medio' | 'alto';
  };
  observed: {
    totalEvents: number;
    usedChannels: string[];
    openedObjects: string[];
    lastEventAt: string | null;
  };
  recommendedProfile: string;
  recommendationMode: RecommendationMode;
  recommendedRoute: string;
  preferenceCta: string;
  updatedAt: string;
};

export type LibraryObject = {
  id: string;
  title: string;
  description: string;
  profiles: string[];
  objectives: string[];
  channels: string[];
  objectType: string;
  difficulty: string;
  requiredProducts: string[];
  requiredData: string[];
  firstAction: string;
  firstPrompt?: string;
  expectedOutput: string;
  cta: string;
  source: string;
  validationStatus: string;
  priority: number;
};

export type LibraryRecommendation = LibraryObject & {
  recommendationRank: number;
  recommendationScore: number;
  recommendationReason: string;
};

export type CommercialSignal = {
  type: string;
  severity: 'low' | 'medium' | 'high';
  label: string;
};

export type LibraryRecommendationResponse = {
  activationProfile: ActivationProfile;
  recommendedObjects: LibraryRecommendation[];
  firstAction: string;
  commercialSignals: CommercialSignal[];
  recommendationVersion: string;
  generatedAt: string;
  source: 'bff' | 'local-fallback';
};

export type LibraryRecommendationParams = {
  role?: string;
  preferredChannel?: string;
  preferredProduct?: string;
  isCurrentCustomer?: boolean;
  observedObjectIds?: string[];
};

export type LibraryEventInput = {
  objectId: string;
  channel: string;
  eventType: 'object_viewed' | 'prompt_copied' | 'recommendation_clicked' | 'mcp_config_copied' | 'api_key_generated' | 'terminal_opened';
  metadata?: Record<string, unknown>;
};
