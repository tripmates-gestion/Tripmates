import { apiFetch } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

export async function login(email: string, password: string) {
    console.log("[AuthProvider] LOGGING IN with:", email, password);
  return apiFetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}


export async function logoutApi(accesstoken: string, refreshToken: string, email: string | undefined) {
  console.log("[AUTHSERVICE] LOGGING OUT with:", email, refreshToken);
  console.log("Accesstoken: ", accesstoken)
  console.log("RefreshToken: ", refreshToken)

  return apiFetch(ENDPOINTS.LOGOUT, {
    method: 'POST',
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accesstoken}` },
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


