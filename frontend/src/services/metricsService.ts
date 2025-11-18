import { apiFetch } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

/**
 * Métrica con eventos en el tiempo.
 * Ejemplo:
 * {
 *   "totalQuantity": 10,
 *   "events": ["2025-11-18T01:58:12.063+00:00", ...]
 * }
 */
export interface TimeSeriesMetric {
  totalQuantity: number;
  events: string[]; // ISO date strings
}

export type LikesMetric = number;

export async function getReviewsMetrics(
  days: number,
  accessToken: string | null
): Promise<TimeSeriesMetric> {
  if (!accessToken) throw new Error('No estás autenticado.');
  return apiFetch(ENDPOINTS.METRICS_REVIEWS + `?days=${days}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function getProfileViewsMetrics(
  days: number,
  accessToken: string | null
): Promise<TimeSeriesMetric> {
  if (!accessToken) throw new Error('No estás autenticado.');
  return apiFetch(ENDPOINTS.METRICS_PROFILE_VIEWS + `?days=${days}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function getLikesMetrics(
  days: number,
  accessToken: string | null
): Promise<LikesMetric> {
  if (!accessToken) throw new Error('No estás autenticado.');
  return apiFetch(ENDPOINTS.METRICS_LIKES + `?days=${days}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}


export async function registerProfileView(
  profileSeenEmail: string,
  accessToken: string | null
): Promise<void> {
  if (!accessToken) throw new Error('No estás autenticado.');

  console.log('Registrando vista de perfil para:', profileSeenEmail);

  const url = `${ENDPOINTS.METRICS_VIEW_PROFILE}?profileSeenEmail=${encodeURIComponent(
    profileSeenEmail
  )}`;

  await apiFetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
