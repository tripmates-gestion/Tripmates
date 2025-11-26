import type { BusinessPublicationResponseDTO } from '../types/Business'
import type { BusinessPubAccountDataDTO } from "../types/AccountData";
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

export async function getTravelersRecommendations(id: string, accessToken: string) {
  try {
    console.log("Fetching travelers recommendations for ID:", id);
    const travelers = await apiFetch(
      ENDPOINTS.USER_RECOMMENDATIONS + id, {
        method: 'GET',
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` }
      }
    );
    console.log("[API FETCH]: VALUE RETURNED AS TRAVELERS RECOMMENDATIONS:", travelers);
    return travelers||[];
  } catch (error) {

    console.error('Error fetching travelers recommendations:', error);
    return [];
  }
}

export async function getBusinessAccountRecommendations(
  id: string,
  accessToken: string
): Promise<BusinessPubAccountDataDTO[]> {
  try {
    console.log("Fetching business account recommendations for ID:", id);
    const recommendations = await apiFetch(
      ENDPOINTS.BUSINESS_ACCOUNT_RECOMMENDATIONS + id,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (Array.isArray(recommendations)) {
      return recommendations;
    }

    return recommendations?.content ?? [];
  } catch (error) {
    console.error("Error fetching business account recommendations:", error);
    return [];
  }
}