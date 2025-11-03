import { apiFetch } from "../api/client";
import { ENDPOINTS } from "../api/endpoints"; 
import type { RoomPack, RoomPackPayload } from "../types/Hotel";

// Obtener todos los room packs del host actual
export async function getMyRoomPacks(token: string): Promise<RoomPack[]> {
  return apiFetch(ENDPOINTS.HOTEL_ROOMPACK, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Crear un nuevo room pack (POST multipart)
export async function appendRoomPack(
  token: string,
  data: RoomPackPayload,
  files: File[] = []
): Promise<RoomPack[]> {
  const fd = new FormData();
  fd.append("data", JSON.stringify(data));
  files.forEach((f) => fd.append("files", f));

  const business = await apiFetch(ENDPOINTS.HOTEL_ROOMPACK, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });

  return business;
}

// Actualizar un room pack por índice (PATCH multipart)
export async function updateRoomPack(
  token: string,
  index: number,
  data?: Partial<RoomPackPayload>,
  files: File[] = [],
  deletePhotoIndexes: number[] = []
): Promise<RoomPack[]> {
  const fd = new FormData();

  // Swagger dice que data es opcional: si se omite, solo se modifican fotos
  if (data && Object.keys(data).length > 0) {
    fd.append("data", JSON.stringify(data));
  }

  files.forEach((f) => fd.append("files", f));

  // ?deletePhotoIndexes=0&deletePhotoIndexes=2 ...
  const qs = new URLSearchParams();
  deletePhotoIndexes.forEach((i) =>
    qs.append("deletePhotoIndexes", String(i))
  );

  const url =
    `${ENDPOINTS.HOTEL_ROOMPACK}/${index}` + (qs.toString() ? `?${qs}` : "");

  const business = await apiFetch(url, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });

  return business;
}

// Borrar un room pack entero
export async function deleteRoomPack(
  token: string,
  index: number
): Promise<RoomPack[]> {
  return apiFetch(`${ENDPOINTS.HOTEL_ROOMPACK}/${index}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}
