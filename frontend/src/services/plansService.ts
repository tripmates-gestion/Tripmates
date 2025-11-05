import { apiFetch } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

export async function getPlans(accessToken: string) {
  console.log("Fetching plans for user");
  console.log("Using access token:", accessToken);
  const response = await apiFetch(ENDPOINTS.GET_PLANS, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  });
  return response;
}

export async function createPlan(accessToken: string, name: string, description: string) {
  console.log("Creating plan for user");
  console.log("Using access token:", accessToken);
  const response = await apiFetch(ENDPOINTS.CREATE_PLAN, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, description }),
  });
  return response;
}