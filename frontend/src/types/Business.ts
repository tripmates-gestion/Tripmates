import type { AccountType, BusinessType as AccountBusinessType } from "./AccountTypes"
import type { LocationDTO } from "./Location"

// ---------------------- Tipos locales ----------------------
export type BusinessType = 'alojamiento' | 'servicio'

export type BusinessPost = {
  id: string
  title: string
  type?: BusinessType
  description: string
  hours: string
  contact: string
  location: LocationDTO
  photos: string[]
  createdAt: string
  rating?: number // opcional para usar con PlaceCard
  tags: string[]  // << nuevo
  openingDays: DayOfWeek[] // << nuevo
}

// ---------------------- Contrato del backend (request) ----------------------
export type DayOfWeek =
  | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'

export type AveragePrice = '$' | '$$' | '$$$'

export function parseHours(scheduleString: string): AttentionSchedule {
  const match = scheduleString.match(/([01]?\d|2[0-3]):[0-5]\d\s*[–-]\s*([01]?\d|2[0-3]):[0-5]\d/)
  if (!match) {
    // Fallback por defecto
    return { openingTime: '09:00', closingTime: '18:00' }
  }
  const [opening, closing] = match[0].split(/[–-]/).map((x) => x.trim())
  return { openingTime: opening, closingTime: closing }
}

export type AttentionSchedule = { 
  openingTime: string
  closingTime: string 
}

export type BusinessPublicationRequestDTO = {
  title: string
  description: string
  phoneNumber: string
  email: string
  location: LocationDTO
  openingDays: DayOfWeek[]
  attentionSchedule: AttentionSchedule
  exceptionalClosingDays?: string[]
  tags: string[]
}

export type PublicationUpdateRequestDTO = {
  title?: string
  description?: string
  phoneNumber?: string
  email?: string
  location?: LocationDTO
  openingDays?: DayOfWeek[]
  attentionSchedule?: AttentionSchedule
  exceptionalClosingDays?: string[]
  tags?: string[]
  deletePhotoIndexes?: number[]
}

// ---------------------- Contrato del backend (response) ----------------------
export type BusinessPublicationResponseDTO = {
  id: string
  title: string
  description: string
  openingDays: DayOfWeek[]
  attentionSchedule: AttentionSchedule
  exceptionalClosingDays: string[]
  phoneNumber: string
  email: string
  location: LocationDTO;
  imageUrls: string[]
  ownerId: string
  ownerUsername: string
  ownerAvatarUrl: string
  businessType?: AccountBusinessType
  createdAt: string
  tags: string[]
}

{/* Deprecado: si bien se usa, no guardo la informacion en los llamados => no uso lo que devuelve */}
export type BusinessUpdateResponseDTO = {
  name: string;
  email: string;
  role: AccountType;
  description: string;
  avatarURL: string;
  businessType: BusinessType;
  openingDays: DayOfWeek[];
  attentionSchedule: AttentionSchedule;
  exceptionalClosingDays: string[];
  phoneNumber: string;
  location: string;
  profileImageUrls: string[];
};

// ---------------------- Tipos de formulario DE PUBLICACIÓN ----------------------
export type FormState = {
  title: string;
  description: string;
  hours: string;          // opcional
  contact: string;        // opcional
  location: LocationDTO;  // opcional
  photos: string[];       // base64 previews
  tags: string[];         // << nuevo
  openingDays: DayOfWeek[]; // << nuevo
  // type: BusinessType | ''  // si ya no usás “tipo”, podés removerlo
};

export const initialFormState: FormState = {
  title: '',
  description: '',
  hours: '',
  contact: '',
  location: { address: '', latitude: 0, longitude: 0 },
  photos: [],
  tags: [],
  openingDays: [], // si queda vacío, en el submit usás DEFAULT_OPENING_DAYS
  // type: '',
};


export type UserStats = { aportes: number; seguidores: number; siguiendo: number };

export const DEFAULT_OPENING_DAYS: DayOfWeek[] = [
  'MONDAY', 
  'TUESDAY', 
  'WEDNESDAY', 
  'THURSDAY', 
  'FRIDAY'
] as const;
