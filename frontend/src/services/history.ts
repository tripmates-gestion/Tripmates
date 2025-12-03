import type { BusinessPublicationResponseDTO } from '../types/Business'
import { apiFetch } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import type { SeenBusiness } from '../types/History';

// Función para obtener recomendaciones de publicaciones de negocios para un usuario viajero
export async function getHistoryLikedAPI(id: string, accessToken: string): Promise<BusinessPublicationResponseDTO[]> {
    try {
        console.log("Fetching history liked for ID:", id);
        const publications = await apiFetch(
            ENDPOINTS.GET_HISTORY_LIKED + id, {
            method: 'GET',
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` }
        }
        );
        return publications || [];
    } catch (error) {

        console.error('Error fetching history liked:', error);
        return [];
    }
}

export async function registerRecentlySeen(id: string, accessToken: string): Promise<void> {
    try {
        console.log("REGISTERING business recently seen with ID:", id);
        await apiFetch(
            ENDPOINTS.REGISTER_RECENTLY_SEEN + id, {
            method: 'POST',
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` }
        }
        );
    } catch (error) {
        console.error('Error registering recently seen:', error);
    }
}

export async function getRecentlySeenBusinessAccounts(accessToken: string): Promise<SeenBusiness[]> {
    try {
        const businessSeenAccounts = await apiFetch(
            ENDPOINTS.MY_RECENTLY_SEEN, {
            method: 'GET',
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` }
        }
        );
        return businessSeenAccounts || [];
    } catch (error) {
        console.error('Error fetching recently seen:', error);
        return [];
    }
}
