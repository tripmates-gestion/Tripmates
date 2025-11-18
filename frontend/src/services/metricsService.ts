import { apiFetch } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

export type MetricValue = number | Record<string, unknown> | null;

export async function getReviewsMetrics(days: number, accessToken: string | null): Promise<MetricValue> {
  if (!accessToken) throw new Error('No estás autenticado.');
  return apiFetch(`${ENDPOINTS.METRICS_REVIEWS}?days=${days}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function getProfileViewsMetrics(days: number, accessToken: string | null): Promise<MetricValue> {
  if (!accessToken) throw new Error('No estás autenticado.');
  return apiFetch(`${ENDPOINTS.METRICS_PROFILE_VIEWS}?days=${days}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function getLikesMetrics(days: number, accessToken: string | null): Promise<MetricValue> {
  if (!accessToken) throw new Error('No estás autenticado.');
  return apiFetch(`${ENDPOINTS.METRICS_LIKES}?days=${days}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function registerProfileView(email: string, accessToken: string | null): Promise<void> {
  if (!accessToken) throw new Error('No estás autenticado.');
  await apiFetch(ENDPOINTS.METRICS_VIEW_PROFILE, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ email }),
  });
}
