// src/utils/normalizePlace.ts
import type { BusinessPlaceDTO } from "../../../types/place";

export function normalizeToBusinessPlace(item: any): BusinessPlaceDTO {
  return {
    id: item.id ?? crypto.randomUUID(),
    title: item.title ?? item.name ?? "Lugar",
    description: item.description ?? null,
    email: item.email ?? null,
    phoneNumber: item.phoneNumber ?? null,
    // si tu backend manda { city, country } lo unimos; si manda string en "location", lo usamos
    location: item.location ?? (
      item.city && item.country ? `${item.city}, ${item.country}` : null
    ),
    image: item.imageUrl ?? item.image ?? null, // por si viene image único
    // cuidar [null] y preferir avatarURL / photoUrl como fallback
    imageUrls: Array.isArray(item.imageUrls) && item.imageUrls.length
      ? item.imageUrls
      : (item.avatarURL ? [item.avatarURL] : (item.photoUrl ? [item.photoUrl] : [null])),
    openingDays: item.openingDays ?? null,
    attentionSchedule: item.attentionSchedule ?? null,
    exceptionalClosingDays: item.exceptionalClosingDays ?? null,
  };
}
