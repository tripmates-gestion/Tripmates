import type { BusinessPublicationResponseDTO } from '../types/Business'
import { apiFetch } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

// Función para obtener recomendaciones de publicaciones de negocios para un usuario viajero
export async function getHistoryLiked(id: string, accessToken: string): Promise<BusinessPublicationResponseDTO[]> {
    try {
        console.log("Fetching history liked for ID:", id);
        const publications = await apiFetch(
            ENDPOINTS.GET_HISTORY_LIKED + id, {
            method: 'GET',
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` }
        }
        );
        console.log("[API FETCH]: VALUE RETURNED AS HISTORY LIKED:", publications);
        return publications?.content || [];
    } catch (error) {

        console.error('Error fetching history liked:', error);
        return [];
    }
}