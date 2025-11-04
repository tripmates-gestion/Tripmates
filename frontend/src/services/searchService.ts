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
