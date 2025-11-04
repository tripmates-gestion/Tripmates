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
  data: Partial<RoomPackPayload> = {},
  files: File[] = [],
  deletePhotoIndexes: number[] = []
): Promise<RoomPack[]> {
  const fd = new FormData();

  // Mezclamos los campos normales con los índices a borrar
  const merged: any = { ...data };
  if (deletePhotoIndexes.length > 0) {
    merged.deletePhotoIndexes = deletePhotoIndexes;
  }

  // Si hay algo que mandar en data, lo serializamos
  if (Object.keys(merged).length > 0) {
    fd.append("data", JSON.stringify(merged));
  }

  // Nuevas fotos (si hay)
  files.forEach((f) => fd.append("files", f));

  const url = `${ENDPOINTS.HOTEL_ROOMPACK}/${index}`;

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
