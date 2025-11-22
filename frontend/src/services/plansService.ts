import { apiFetch } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import type { Plan } from "../types/Plans";

export async function getPlans(accessToken: string): Promise<Plan[]> {
  const response = await apiFetch(ENDPOINTS.GET_PLANS, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  });
  return Array.isArray(response) ? response : [];
}

export async function getPlanById(accessToken: string, planId: string): Promise<Plan> {
  const response = await apiFetch(ENDPOINTS.COMMUNITY_PLAN(planId), {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  });
  return response as Plan;
}

export async function createPlan(accessToken: string, name: string, description: string) {
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

export async function deletePlan(accessToken: string, planId: string) {
  const endpoint = ENDPOINTS.DELETE_PLAN.replace("{id}", planId);
  
  const response = await apiFetch(endpoint, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  });

  console.log("Delete plan response:", response);
  return response;
}

export async function addPublicationToPlan(accessToken: string, planId: string, publicationId: string) {
  const endpoint = ENDPOINTS.PATCH_PLAN.replace("{id}", planId);
  const body = {
    publicationsIdList: [publicationId],
  };

  const response = await apiFetch(endpoint, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${accessToken}`
    },
    body: JSON.stringify(body),
  });
  return response;
}

export async function updatePlan(accessToken: string, planId: string, name: string, description: string, deletePublicationIndexes: number[]) {
  const endpoint = ENDPOINTS.PATCH_PLAN.replace("{id}", planId);
  const body = {
    name,
    description,
    deletePublicationIndexes
  };

  const response = await apiFetch(endpoint, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${accessToken}`
    },
    body: JSON.stringify(body),
  });
  return response;
}

export async function inviteUserToPlan(accessToken: string, planId: string, userId: string) {
  const endpoint = ENDPOINTS.INVITE_USER_TO_PLAN(planId, userId);
  return apiFetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  });
}

export async function acceptPlanInvitation(accessToken: string, planId: string) {
  const endpoint = ENDPOINTS.ACCEPT_INVITATION(planId);
  return apiFetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  });
}

export async function declinePlanInvitation(accessToken: string, planId: string) {
  const endpoint = ENDPOINTS.DECLINE_INVITATION(planId);
  return apiFetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  });
}
