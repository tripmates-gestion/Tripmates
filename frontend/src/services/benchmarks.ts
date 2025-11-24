import { apiFetch } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

export interface BusinessBenchmarksDTO {
    id: string;
    visible: boolean;
}

export const getMyBenchmarksAPI = async (accessToken: string): Promise<BusinessBenchmarksDTO[]> => {

    try {
        const benchmarks = await apiFetch(
            ENDPOINTS.BUSINESS_BENCHMARKS,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        console.log("[API FETCH]: Public benchmarks returned:", benchmarks);
        return benchmarks || [];
    } catch (error) {
        console.error("Error fetching benchmarks:", error);
        return [];
    }
};

export interface UpdateBusinessBenchmarksVisibilityRequest {
    updates: { id: string; visible: boolean }[];
}

export const updateMyBenchmarksVisibilityAPI = async (accessToken: string, changes: UpdateBusinessBenchmarksVisibilityRequest): Promise<void> => {
    try {
        console.log("request for update visibility: ", changes);
        await apiFetch(
            ENDPOINTS.BUSINESS_BENCHMARKS,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(changes),
            }
        );
        console.log(`Updated visibility for token ${accessToken}:`, changes);
    } catch (error) {
        console.error("Error updating benchmarks visibility:", error);
    }
};

export async function getPublicBusinessBenchmarks(
    businessId: string,
    accessToken: string
): Promise<string[]> {
    try {
        console.log("Fetching public benchmarks for business ID:", businessId);
        const benchmarks = await apiFetch(
            ENDPOINTS.GET_PUBLIC_BENCHMARKS + businessId,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        console.log("[API FETCH]: Public benchmarks returned:", benchmarks);

        if (Array.isArray(benchmarks)) {
            return benchmarks.map((b: any) => (typeof b === 'object' && b.id ? b.id : b));
        }

        return [];
    } catch (error) {
        console.error("Error fetching public benchmarks:", error);
        return [];
    }
}
