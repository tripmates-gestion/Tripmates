import type {
  BusinessPublicationRequestDTO,
  BusinessPublicationResponseDTO,
} from '../types/business'
import { apiFetch } from "../api/client"; // ruta a tu apiFetch
import { ENDPOINTS } from "../api/endpoints";

// ---------------------- API Client ----------------------

/**
 * Crea una nueva publicación de negocio
 * @param data - Datos de la publicación
 * @param files - Archivos de imágenes a subir
 * @param accessToken - Token de autenticación
 * @param signal - AbortSignal para cancelar la petición
 * @returns Datos de la publicación creada
 * @throws Error si falla la creación o si no hay token
 */
export async function createBusinessPublication(
  data: BusinessPublicationRequestDTO,
  files: File[],
  accessToken: string | null,
  signal?: AbortSignal
): Promise<BusinessPublicationResponseDTO> {
  if (!accessToken) throw new Error("No estás autenticado.");

  const fd = new FormData();
  fd.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }), "data.json");
  files.forEach((f) => fd.append("files", f, f.name));

  return apiFetch(ENDPOINTS.PUBLISH_BUSINESS, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` }, // SIN Content-Type
    body: fd,
    signal,
  }) as Promise<BusinessPublicationResponseDTO>;
}

// Obtiene todas las publicaciones del usuario autenticado
export async function getBusinessPublications(
  accessToken: string | null
): Promise<BusinessPublicationResponseDTO[]> {
  if (!accessToken) throw new Error("No estás autenticado.");
  return apiFetch(ENDPOINTS.GET_BUSINESS_PUBLICATIONS, {
    headers: { Authorization: `Bearer ${accessToken}` },
  }) as Promise<BusinessPublicationResponseDTO[]>;
}

// Actualiza una publicación de negocio
export async function patchBusinessPublication(
  accessToken: string | null,
  id: string
): Promise<BusinessPublicationResponseDTO[]> {
  if (!accessToken) throw new Error("No estás autenticado.");
  return apiFetch(ENDPOINTS.PATCH_BUSINESS_PUBLICATION + id, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}` },
  }) as Promise<BusinessPublicationResponseDTO[]>;
}

// Elimina una publicación de negocio
export async function deleteBusinessPublication(
  accessToken: string | null,
  id: string
): Promise<void> {
  if (!accessToken) throw new Error("No estás autenticado.");
  return apiFetch(ENDPOINTS.DELETE_BUSINESS_PUBLICATION + id, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  }) as Promise<void>;
}