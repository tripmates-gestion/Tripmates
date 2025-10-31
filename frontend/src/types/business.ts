import type { AccountType } from "./AccountTypes"

// ---------------------- Tipos locales ----------------------
export type BusinessType = 'alojamiento' | 'servicio'

export type BusinessPost = {
  id: string
  title: string
  type?: BusinessType
  description: string
  hours: string
  contact: string
  location: string
  photos: string[]
  createdAt: string
  rating?: number // opcional para usar con PlaceCard
  tags: string[]  // << nuevo
  openingDays: DayOfWeek[] // << nuevo
}

// ---------------------- Contrato del backend (request) ----------------------
export type DayOfWeek =
  | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'

type DayMapping = {
  [key in DayOfWeek]: string
}

const dayToSpanish: DayMapping = {
  'MONDAY': 'Lunes',
  'TUESDAY': 'Martes',
  'WEDNESDAY': 'Miércoles',
  'THURSDAY': 'Jueves',
  'FRIDAY': 'Viernes',
  'SATURDAY': 'Sábado',
  'SUNDAY': 'Domingo'
}

const dayToEnglish: Record<string, DayOfWeek> = {
  'Lunes': 'MONDAY',
  'Martes': 'TUESDAY',
  'Miércoles': 'WEDNESDAY',
  'Jueves': 'THURSDAY',
  'Viernes': 'FRIDAY',
  'Sábado': 'SATURDAY',
  'Domingo': 'SUNDAY'
}

export function mapDayToSpanish(day: DayOfWeek): string {
  return dayToSpanish[day] || day
}

export function mapDaysToSpanish(days: DayOfWeek[]): string[] {
  return days.map(day => dayToSpanish[day] || day)
}
export function mapDaysToEnglish(days: string[]): DayOfWeek[] {
  return days.map(day => dayToEnglish[day as DayOfWeek] || day as DayOfWeek)
}

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
  location: string
  openingDays: DayOfWeek[]
  attentionSchedule: AttentionSchedule
  exceptionalClosingDays?: string[]
  tags: string[]
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
  location: string
  imageUrls: string[]
  ownerId: string
  ownerUsername: string
  ownerAvatarUrl: string
  createdAt: string
  tags: string[]
}

export type UserResumeResponseDTO = {
  email: string
  description: string
  avatarURL: string
  businessType: BusinessType
  openingDays: DayOfWeek[]
  attentionSchedule: AttentionSchedule
  exceptionalClosingDays: string[]
  phoneNumber: string
  location: string
  imageUrls: string[]
}

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

// ---------------------- Tipos de formulario ----------------------
export type FormState = {
  title: string;
  description: string;
  hours: string;          // opcional
  contact: string;        // opcional
  location: string;       // opcional
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
  location: '',
  photos: [],
  tags: [],
  openingDays: [], // si queda vacío, en el submit usás DEFAULT_OPENING_DAYS
  // type: '',
};


export type UserStats = { aportes: number; seguidores: number; siguiendo: number };
export type UpdateProfileFormState = {
  name: string;
  description: string;
  openningDays: DayOfWeek[];
  openingHours: string;
  location: string;
  phone: string;
  avatarUrl?: string;
  avatar?: string;//uploading
  uploadingPhotos: string[];
};
// ---------------------- Tipos con el contenido del perfil de negocio----------------------
//Campos que no son seteados por la información de sesión (común) son null
//podría cumplir la misma funcionalidad que el DTO para el request excepto que 
export type CompleteBusinessProfile = {
  name: string;
  description: string;
  openningDays: DayOfWeek[];
  // exceptionalClosingDays?:string[];
  openingHours: AttentionSchedule | null;
  location:string;
  phone:string;
  businessUrlPhotos: string[];//array de links a las fotos

  avatarUrl?: string;
  coverUrl?: string;
  stats: UserStats;
};



export type BusinessUpdateRequestDTO={
  name: string;
  description: string;
  phoneNumber:string;
  location:string;
  openingDays: DayOfWeek[];
  attentionSchedule: AttentionSchedule;
  exceptionalClosingDays?:string[];  
}


export const DEFAULT_OPENING_DAYS: DayOfWeek[] = [
  'MONDAY', 
  'TUESDAY', 
  'WEDNESDAY', 
  'THURSDAY', 
  'FRIDAY'
] as const;
