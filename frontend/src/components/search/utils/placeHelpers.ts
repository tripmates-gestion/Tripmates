// ──────────────────────────────────────────────────────────────────────────────
// utils/placeHelpers.ts
// ──────────────────────────────────────────────────────────────────────────────
import type { BusinessPlaceDTO, DayOfWeek } from "../../../types/place";



const DAYS_ORDER: DayOfWeek[] = [
  "MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"
];

const DAY_LABEL: Record<DayOfWeek, string> = {
  MONDAY: "Lun", TUESDAY: "Mar", WEDNESDAY: "Mié", THURSDAY: "Jue",
  FRIDAY: "Vie", SATURDAY: "Sáb", SUNDAY: "Dom"
};

export function sanitizeImages(place: BusinessPlaceDTO): string[] {
  const fromArray = (place.imageUrls || []).filter(Boolean) as string[];
  const single = place.image ? [place.image] : [];
  const unique = [...new Set([...fromArray, ...single])];
  return unique.length ? unique : ["/placeholder.jpg"]; // fallback seguro
}

function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

function todayKey(d: Date): DayOfWeek {
  return ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"][d.getDay()] as DayOfWeek;
}

function isExceptionalClosed(todayISO: string, dates: string[] | null | undefined) {
  return !!dates?.some((x) => x === todayISO);
}

export function computeOpenNow(place: BusinessPlaceDTO, now: Date): boolean | null {
  if (!place.attentionSchedule || !place.openingDays?.length) return null; // desconocido
  const k = todayKey(now);
  if (!place.openingDays.includes(k)) return false;
  const todayISO = now.toISOString().slice(0, 10);
  if (isExceptionalClosed(todayISO, place.exceptionalClosingDays)) return false;
  const open = toMinutes(place.attentionSchedule.openingTime);
  const close = toMinutes(place.attentionSchedule.closingTime);
  const minutes = now.getHours() * 60 + now.getMinutes();
  if (close > open) return minutes >= open && minutes < close;
  return minutes >= open || minutes < close; // horario nocturno cruzando medianoche
}

export { DAYS_ORDER, DAY_LABEL };