/* eslint-disable @typescript-eslint/no-explicit-any */
const API_BASE_URL = "http://localhost:8080";
const CODE_403 = 403;

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const { headers = {}, body } = options as { headers?: Record<string, string>, body?: any };

  const isForm = typeof FormData !== "undefined" && body instanceof FormData;

  // headers por defecto: solo agregar Content-Type si NO es FormData y no lo pasaron
  const baseHeaders: Record<string, string> = {};
  if (!isForm && !("Content-Type" in headers)) {
    baseHeaders["Content-Type"] = "application/json";
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...baseHeaders, ...headers },
  });


  const raw = await response.text().catch(() => "");
  let payload: any = null;
  try { payload = raw ? JSON.parse(raw) : null; } catch { /* texto plano */ }

  if (!response.ok) {
    if (response.status !== CODE_403) {
      // priorizar título/detalle si vienen del back
      const msg =
        (payload && (payload.title || payload.detail || payload.message || payload.error)) ||
        raw ||
        `Falla en request (HTTP ${response.status})`;
      throw new Error(msg);
    }
    throw new Error("[Api Fetch]: Falla por autenticación, token expiró.");
  }

  return payload ?? (raw || null);
}
