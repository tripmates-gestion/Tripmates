import { apiFetch } from "../api/client"
import { ENDPOINTS } from "../api/endpoints"
import type { SearchBusinessFilters } from "../types/searchBusinessFilters"

// QUITAR CUANDO SEA PUBLICO
export async function searchBusiness(accesstoken: string,filters: SearchBusinessFilters = {}) {
  const response = apiFetch(ENDPOINTS.SEARCH_BUSINESS, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accesstoken}` },
    body: JSON.stringify(filters),
  })
  return response
}

export async function searchTravelers(accesstoken: string, username?: string, location?: string): Promise<any> {
  const params = new URLSearchParams();
  
  if (username) params.append('username', username);
  if (location) params.append('location', location);
  
  const queryString = params.toString();
  const uri = queryString 
    ? `${ENDPOINTS.SEARCH_TRAVELERS}?${queryString}`
    : ENDPOINTS.SEARCH_TRAVELERS;
    
  const response = apiFetch(uri, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accesstoken}` },
  });
  return response;
}

