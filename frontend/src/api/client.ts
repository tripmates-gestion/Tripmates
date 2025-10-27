const API_BASE_URL = 'http://localhost:8080';
const CODE_403 = 403;//no tiene body. 

//devuelve el body (la data)
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

    if (!response.ok) {
        if (response.status !== CODE_403) {
            const errorData = await response.json();
            const errorMessage = errorData?.title || 'Falla en request (no title included)';
            throw new Error(errorMessage);
        }
        throw new Error('Falla por autenticación, token expiró.');
    }
    return response.json();
}
