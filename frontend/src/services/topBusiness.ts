import { apiFetch } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import type { BusinessPubAccountDataDTO } from "../types/AccountData";

export async function getTopTrendingBusinesses(limit: number): Promise<BusinessPubAccountDataDTO[]> {
    const uri = `${ENDPOINTS.TOP_TRENDING_BUSINESSES}?n=${limit}`;
    return apiFetch(uri, { method: "GET" });
}