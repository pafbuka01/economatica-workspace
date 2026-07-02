const BFF_BASE_URL = import.meta.env.VITE_WORKSPACE_BFF_BASE_URL ?? '';

export const WORKSPACE_BFF_ENDPOINTS = {
  activationProfileMe: '/userbffapi/v4/workspace/activation-profile/me',
  activationProfilePreferences: '/userbffapi/v4/workspace/activation-profile/preferences',
  libraryObjects: '/userbffapi/v4/workspace/library/objects',
  libraryRecommendations: '/userbffapi/v4/workspace/library/recommendations',
  libraryEvents: '/userbffapi/v4/workspace/library/events',
  onboarding: '/userbffapi/v4/workspace/onboarding',
} as const;

export function workspaceBffUrl(endpoint: string) {
  if (!BFF_BASE_URL) return endpoint;
  return `${BFF_BASE_URL.replace(/\/$/, '')}${endpoint}`;
}
