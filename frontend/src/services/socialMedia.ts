import { apiFetch } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

export interface SocialMediaLinks {
  instagramURL?: string;
  xURL?: string;
  facebookURL?: string;
}

export async function getUserSocialMedia(email: string, accesstoken: String | null): Promise<SocialMediaLinks> {
  const response = await apiFetch(ENDPOINTS.USER_MEDIA(email), {
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accesstoken}` },
    method: "GET",
  });

  return response as SocialMediaLinks;
}

export async function updateMySocialMedia(data: SocialMediaLinks, accesstoken: String | null): Promise<void> {
  await apiFetch(ENDPOINTS.MY_MEDIA, {
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accesstoken}` },
    method: "POST",
    body: JSON.stringify(data),
  });
}