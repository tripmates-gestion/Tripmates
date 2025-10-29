// ──────────────────────────────────────────────────────────────────────────────
// types/place.ts
// ──────────────────────────────────────────────────────────────────────────────
export type DayOfWeek =
  | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";

export type AttentionSchedule = { openingTime: string; closingTime: string } | null;

export type BusinessPlaceDTO = {
  id?: string;                 // si hay id del negocio
  title: string;               // ej: "Buen Comer"
  description: string | null;
  email: string | null;
  phoneNumber: string | null;
  location: string | null;
  image?: string | null;       // algunos backends devuelven image single
  imageUrls?: (string | null)[] | null; // puede venir [null]
  openingDays: DayOfWeek[] | null;
  attentionSchedule: AttentionSchedule;  // puede venir null
  exceptionalClosingDays: string[] | null; // ISO YYYY-MM-DD
};