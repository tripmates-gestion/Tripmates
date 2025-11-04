import { apiFetch } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import type { Review } from "../types/review";

export async function saveReview(review: Review, accessToken: string) {
  if (!review.publicationId) {
    throw new Error("publicationId is required to save review");
  }
  console.log("Saving review for publication ID:", review.publicationId);
  const reviewBody = new FormData();
  reviewBody.append(
    "data",
    JSON.stringify({
        title: review.title,
        content: review.text,
    })
    );
  const response = await apiFetch(ENDPOINTS.POST_REVIEW.replace("{id}", review.publicationId), {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
    body: reviewBody,
  });
  return response;
}

export async function getReviews(publicationId: string, accessToken: string) {
  console.log("Fetching reviews for publication ID:", publicationId);
  const response = await apiFetch(`/publications/${publicationId}/reviews`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  });
  return response;
}