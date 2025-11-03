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

// UPDATE (PATCH multipart)
export async function updateMenuItem(
    token: string,
    index: number,
    data: Partial<Omit<MenuItem, 'photosURLs'>>,
    files: File[] = [],
    deletePhotoIndexes: number[] = []
  ) {
    const fd = new FormData();
  
    // Siempre mandamos 'data' (aunque sea vacío), muchos backends lo agradecen
    const hasData = data && Object.keys(data).length > 0;
    fd.append('data', hasData ? JSON.stringify(data) : '{}');
  
    files.forEach((f) => fd.append('files', f));
  
    // índices únicos y en descendente para evitar corrimientos
    const delIdx = Array.from(new Set(deletePhotoIndexes))
      .filter((n) => Number.isInteger(n) && n >= 0)
      .sort((a, b) => b - a);
  
    const qs = new URLSearchParams();
    delIdx.forEach((i) => qs.append('deletePhotoIndexes', String(i)));
  
    const urlBase = `${ENDPOINTS.RESTAURANT_MENU}/${index}`;  // .../restaurant/0
    const url = delIdx.length ? `${urlBase}?${qs.toString()}` : urlBase;
  
    console.log('[PATCH menu]', { url, data, files: files.length, delIdx });
  
    const business = await apiFetch(url, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }, // NO setees Content-Type con FormData
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
