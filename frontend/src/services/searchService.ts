import { apiFetch } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

export async function searchHotels(token: string, queryParams: { location: string; }) {
    let endpoint = ENDPOINTS.SEARCH + '?businessType=HOSTING';
    
    if (queryParams.location && queryParams.location.trim() !== '') {
        endpoint += `&location=${encodeURIComponent(queryParams.location.trim())}`;
    }   

    console.log('Searching hotels at endpoint:', endpoint);

    return apiFetch(endpoint, {
        method: 'GET',
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
}

export async function searchRestaurants(token: string, queryParams: { location: string; }){
    let endpoint = ENDPOINTS.SEARCH + '?businessType=RESTAURANT';
    
    if (queryParams.location && queryParams.location.trim() !== '') {
        endpoint += `&location=${encodeURIComponent(queryParams.location.trim())}`;
    }    
    
    console.log('Searching restaurants at endpoint:', endpoint);

    return apiFetch(endpoint, {
        method: 'GET',
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
}
