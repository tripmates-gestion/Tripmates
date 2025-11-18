import type { BusinessPublicationResponseDTO } from '../types/Business'
import { apiFetch } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

// Función para obtener recomendaciones de publicaciones de negocios para un usuario viajero
export async function getBusinessPublicationsPublicRecommendations(id: string, accessToken: string): Promise<BusinessPublicationResponseDTO[]> {
  try {
    console.log("Fetching business publications recommendations for ID:", id);
    const publications = await apiFetch(
      ENDPOINTS.BUSSINESS_PUBLICATION_RECOMMENDATIONS + id, {
        method: 'GET',
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` }
      }
    );
    console.log("[API FETCH]: VALUE RETURNED AS RECOMMENDATIONS:", publications);
    return publications?.content||[];
  } catch (error) {

    console.error('Error fetching business publications:', error);
    return [];
  }
}