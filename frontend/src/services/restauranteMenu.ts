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
// pasá las urls actuales (si las tenés) para que el back les haga append
export async function updateMenuItem(
    token: string,
    index: number,
    data: Partial<Omit<MenuItem, "photosURLs">>,
    files: File[] = [],
    currentPhotos: string[] = []         
) {
    const fd = new FormData();
    fd.append("data", JSON.stringify({ ...data, photosURLs: currentPhotos ?? [] }));
    files.forEach(f => fd.append("files", f));

    const business = await apiFetch(`${ENDPOINTS.RESTAURANT_MENU}/${index}`, {
        method: "PATCH",
        headers: withAuth(token),
        body: fd,
    });
    return extractMenu(business);
}

// DELETE
export async function deleteMenuItem(token: string, index: number) {
    const business = await apiFetch(`${ENDPOINTS.RESTAURANT_MENU}/${index}`, {
        method: "DELETE",
        headers: withAuth(token),
    });
    return extractMenu(business);
}
