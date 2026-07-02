import { WORKSPACE_BFF_ENDPOINTS } from './endpoints';
import { apiRequest } from './api';
import { localLibraryObjects } from './catalog';
import { buildLocalActivationProfile, buildLocalRecommendationResponse } from './engine';
import type { ActivationProfile, LibraryEventInput, LibraryObject, LibraryRecommendationParams, LibraryRecommendationResponse } from './types';

function toQuery(params: LibraryRecommendationParams) {
  const query = new URLSearchParams();
  if (params.role) query.set('role', params.role);
  if (params.preferredChannel) query.set('preferredChannel', params.preferredChannel);
  if (params.preferredProduct) query.set('preferredProduct', params.preferredProduct);
  if (typeof params.isCurrentCustomer === 'boolean') query.set('isCurrentCustomer', String(params.isCurrentCustomer));
  return query.toString();
}

export const libraryService = {
  async getObjects(): Promise<LibraryObject[]> {
    try {
      const response = await apiRequest<{ objects: LibraryObject[] }>(WORKSPACE_BFF_ENDPOINTS.libraryObjects);
      return response.objects;
    } catch {
      return localLibraryObjects;
    }
  },

  async getRecommendations(params: LibraryRecommendationParams): Promise<LibraryRecommendationResponse> {
    const query = toQuery(params);
    const endpoint = query ? `${WORKSPACE_BFF_ENDPOINTS.libraryRecommendations}?${query}` : WORKSPACE_BFF_ENDPOINTS.libraryRecommendations;

    try {
      return await apiRequest<LibraryRecommendationResponse>(endpoint);
    } catch {
      return buildLocalRecommendationResponse(params);
    }
  },

  async recordEvent(input: LibraryEventInput): Promise<{ accepted: boolean; source: 'bff' | 'local-fallback' }> {
    try {
      await apiRequest(WORKSPACE_BFF_ENDPOINTS.libraryEvents, {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return { accepted: true, source: 'bff' };
    } catch {
      return { accepted: true, source: 'local-fallback' };
    }
  },
};

export const activationProfileService = {
  async getMe(params: LibraryRecommendationParams = {}): Promise<ActivationProfile> {
    try {
      const response = await apiRequest<{ activationProfile: ActivationProfile }>(WORKSPACE_BFF_ENDPOINTS.activationProfileMe);
      return response.activationProfile;
    } catch {
      return buildLocalActivationProfile(params);
    }
  },

  async updatePreferences(params: LibraryRecommendationParams): Promise<LibraryRecommendationResponse> {
    try {
      return await apiRequest<LibraryRecommendationResponse>(WORKSPACE_BFF_ENDPOINTS.activationProfilePreferences, {
        method: 'PATCH',
        body: JSON.stringify(params),
      });
    } catch {
      return buildLocalRecommendationResponse(params);
    }
  },
};

export type { ActivationProfile, LibraryEventInput, LibraryObject, LibraryRecommendation, LibraryRecommendationParams, LibraryRecommendationResponse } from './types';
