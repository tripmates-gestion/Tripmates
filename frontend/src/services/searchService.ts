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

export async function searchTravelers(accesstoken: string, username: string|null, location: string|null): Promise<any> {
  const params = new URLSearchParams();
  
  if (username!=null && username.trim()!="") params.append('username', username.trim());
  if (location!=null && location.trim()!="") params.append('location', location.trim());
  
  const queryString = params.toString();
  const uri = queryString 
    ? `${ENDPOINTS.SEARCH_TRAVELERS}?${queryString}`
    : ENDPOINTS.SEARCH_TRAVELERS;
    
  const response = apiFetch(uri, {
    method: "GET",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accesstoken}` },
  });
  return response;
}


export async function getUserById(accesstoken: string, userName: string) {
  const uri = `${ENDPOINTS.SEARCH_TRAVELERS}?username=${userName}`
  return apiFetch(uri, {
    method: "GET",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accesstoken}` }
  });
}