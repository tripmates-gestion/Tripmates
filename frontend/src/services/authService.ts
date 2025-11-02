import { apiFetch } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

export async function loginApi(email: string, password: string) {
    console.log("[AuthService] LOGGING IN with:", email, password);
  return apiFetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function logoutApi(accesstoken: string, refreshToken: string, email: string | undefined) {
  console.log("[AuthService] LOGGING OUT with:", email);
  console.log("Accesstoken: ", accesstoken)
  console.log("RefreshToken: ", refreshToken)

  return apiFetch(ENDPOINTS.LOGOUT, {
    method: 'POST',
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accesstoken}` },
    body: JSON.stringify({ email }),
  });

}

export async function refreshAccessTokenApi(token: string, refreshToken: string, email?: string) {
  return apiFetch(ENDPOINTS.REFRESH_TOKEN, {
    method: 'POST',
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ refreshToken, email }),
  });
}

export async function registerUserApi(name: string, email: string, password: string,  role: 'USER' | 'BUSINESS', businessType: 'RESTAURANT' | 'HOSTING' | 'TOURISM' | null){
  const requestBody = {
    name,
    email,
    password,
    role,
    ...(role !== 'USER' && { businessType })//agrego businessType solo si el rol es BUSINESS
  };
  console.log('[Register User API] Sending request to: POST http://localhost:8080/auth/register with body: ',{
    ...requestBody
  });

  return apiFetch(ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });
}

