import { apiFetch } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import type { BusinessUpdateRequestDTO, BusinessUpdateResponseDTO } from '../types/business';

export async function getCurrentUser(token: string) {
    return apiFetch(ENDPOINTS.USER_ME, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    });
}

export async function updateBusinessUser(
  data: BusinessUpdateRequestDTO,
  avatar: File | null,
  files: File[],
  accessToken: string | null,
  signal?: AbortSignal
): Promise<BusinessUpdateResponseDTO> {
  if (!accessToken) throw new Error("No estás autenticado.");
  
  const fd = new FormData();
  fd.append("data", JSON.stringify(data));
  
  if (avatar) fd.append("avatar", avatar, avatar.name);
  files.forEach((f) => fd.append("files", f, f.name));
  console.log("[USER SERVICE]: Sending request with:\n", "Method: PATCH\n", "Endpoint: ", ENDPOINTS.USER_ME, "\n", "Headers ", { Authorization: `Bearer ${accessToken}` }, "\n")
  console.log("Body: ")
  fd.forEach((value, key) => console.log(key, value))
  
  return apiFetch(ENDPOINTS.USER_ME, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}` }, // SIN Content-Type
    body: fd,
    signal,
  }) as Promise<BusinessUpdateResponseDTO>;
}