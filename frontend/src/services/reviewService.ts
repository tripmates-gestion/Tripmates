import { apiFetch } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import { dataURLtoFile, validateFile } from "../components/publications/utils/imageHelpers";
import type { Review } from "../types/review";

export async function saveReview(review: Review, accessToken: string, photos: string[]) {
    if (!review.publicationId) {
        throw new Error("publicationId is required to save review");
    }
    const files: File[] = photos.map((photo, i) =>
        dataURLtoFile(photo, `photo_${i + 1}.jpg`)
    )
  
    // Validar tamaño/tipo de archivos
    files.forEach(validateFile)
  
    console.log("Saving review for publication ID:", review.publicationId);
    const reviewBody = new FormData();
    reviewBody.append(
        "data",
        JSON.stringify({
            title: review.title,
            content: review.text,
            rating: review.rating,
        })
    );
    files.forEach((f) => reviewBody.append("files", f, f.name));
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
  const response = await apiFetch(ENDPOINTS.GET_PUBLICATION_REVIEWS.replace("{id}", publicationId), {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  });
  return response;
}

export async function getReviewsForUser(accessToken: string, userId: string) {
  console.log("Fetching reviews for user: ", userId);
  console.log("Using access token: ", accessToken);
  const response = await apiFetch(ENDPOINTS.GET_USER_REVIEWS.replace("{id}", userId), {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  });
  return response;
}