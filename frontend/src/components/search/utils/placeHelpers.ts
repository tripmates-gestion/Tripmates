// ──────────────────────────────────────────────────────────────────────────────
// utils/placeHelpers.ts
// ──────────────────────────────────────────────────────────────────────────────
import type { DayOfWeek } from "../../../types/place";
import type {BusinessPubAccountDataDTO} from "../../../types/AccountData";



const DAYS_ORDER: DayOfWeek[] = [
  "MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"
];

const DAY_LABEL: Record<DayOfWeek, string> = {
  MONDAY: "Lun", TUESDAY: "Mar", WEDNESDAY: "Mié", THURSDAY: "Jue",
  FRIDAY: "Vie", SATURDAY: "Sáb", SUNDAY: "Dom"
};

export function sanitizeImages(place: BusinessPubAccountDataDTO): string[] {
  const fromArray = (place.profileImageUrls || []).filter(Boolean) as string[];
  const unique = [...new Set([...fromArray])];
  return unique.length ? unique : ["/placeholder.jpg"]; // fallback seguro
}

function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

function todayKey(d: Date): DayOfWeek {
  return ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"][d.getDay()] as DayOfWeek;
}

export function computeOpenNow(place: BusinessPubAccountDataDTO, now: Date): boolean | null {
  if (!place.attentionSchedule || !place.openingDays?.length) return null; // desconocido
  const k = todayKey(now);
  if (!place.openingDays.includes(k)) return false;
  const open = toMinutes(place.attentionSchedule.openingTime);
  const close = toMinutes(place.attentionSchedule.closingTime);
  const minutes = now.getHours() * 60 + now.getMinutes();
  if (close > open) return minutes >= open && minutes < close;
  return minutes >= open || minutes < close; // horario nocturno cruzando medianoche
}

export { DAYS_ORDER, DAY_LABEL };