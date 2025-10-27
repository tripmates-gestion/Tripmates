import { apiFetch } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

export async function login(email: string, password: string) {
    console.log("[AuthProvider] LOGGING IN with:", email, password);
  return apiFetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}


export async function logout(token: string, email: string) {
  return apiFetch(ENDPOINTS.LOGOUT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ email }),
  });
}

export async function refreshAccessToken(token: string, refreshToken: string, email?: string) {
  return apiFetch(ENDPOINTS.REFRESH_TOKEN, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ refreshToken, email }),
  });
}


