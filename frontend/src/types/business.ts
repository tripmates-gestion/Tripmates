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


export const DEFAULT_OPENING_DAYS: DayOfWeek[] = [
  'MONDAY', 
  'TUESDAY', 
  'WEDNESDAY', 
  'THURSDAY', 
  'FRIDAY'
] as const;
