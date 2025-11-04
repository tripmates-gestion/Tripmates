import type { MenuItem } from '../types/Restaurant';
import { apiFetch } from "../api/client";
import { ENDPOINTS } from "../api/endpoints"; 


// El back devuelve el Business completo; el menú suele venir en "menu" o similar.
// Si tu clave exacta es otra, cambiala en extractMenu().
function extractMenu(business: any) {
    return business?.menu ?? business?.menuItems ?? [];
}

function withAuth(token: string) {
    return { Authorization: `Bearer ${token}` };
}

// CREATE (POST multipart)
export async function appendMenuItem(
    token: string,
    data: Omit<MenuItem, "photosURLs">,
    files: File[] = []
) {
    
    console.log("FormData to send:", data);
    const fd = new FormData();
    fd.append("data", JSON.stringify({ ...data, photosURLs: [] }));
    files.forEach(f => fd.append("files", f));

    const business = await apiFetch(ENDPOINTS.RESTAURANT_MENU, {
        method: "POST",
        headers: withAuth(token),
        body: fd,
    });

    return extractMenu(business);
}

// services/restauranteMenu.ts

// UPDATE (PATCH multipart)
export async function updateMenuItem(
  token: string,
  index: number,
  data: Partial<Omit<MenuItem, "photosURLs">> = {},
  files: File[] = [],
  deletePhotoIndexes: number[] = []
) {
  const fd = new FormData();

  // normalizamos índices
  const delIdx = Array.from(new Set(deletePhotoIndexes))
    .filter((n) => Number.isInteger(n) && n >= 0);

  // armamos el payload que va en "data"
  const merged: any = { ...data };
  if (delIdx.length > 0) {
    merged.deletePhotoIndexes = delIdx;
  }

  // solo mandamos "data" si hay algo que enviar
  if (Object.keys(merged).length > 0) {
    fd.append("data", JSON.stringify(merged));
  }

  // nuevas imágenes (si hay)
  files.forEach((f) => fd.append("files", f));

  const url = `${ENDPOINTS.RESTAURANT_MENU}/${index}`; // p.ej. /users/me/restaurant/0

  console.log("[PATCH menu]", {
    url,
    merged,
    files: files.length,
  });

  // (opcional) debug de FormData
  for (const [key, value] of fd.entries()) {
    console.log(`FormData - ${key}:`, value);
  }

  const business = await apiFetch(url, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` }, // no seteamos Content-Type
    body: fd,
  });

  return business;
}



// DELETE
export async function deleteMenuItem(token: string, index: number) {
    const business = await apiFetch(`${ENDPOINTS.RESTAURANT_MENU}/${index}`, {
        method: "DELETE",
        headers: withAuth(token),
    });
    return extractMenu(business);
}
