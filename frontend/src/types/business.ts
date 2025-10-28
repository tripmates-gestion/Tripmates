// ---------------------- Tipos locales ----------------------
export type BusinessType = 'alojamiento' | 'servicio'

export type BusinessPost = {
  id: string
  title: string
  type: BusinessType
  description: string
  hours: string
  contact: string
  location: string
  photos: string[]
  createdAt: string
  rating?: number // opcional para usar con PlaceCard
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
  tags: []
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
}

// ---------------------- Tipos de formulario ----------------------
export type FormState = {
  title: string
  type: BusinessType | ''
  description: string
  hours: string
  contact: string
  location: string
  photos: string[] // base64 para preview
}

export const initialFormState: FormState = {
  title: '',
  type: '',
  description: '',
  hours: '',
  contact: '',
  location: '',
  photos: [],
}

export const DEFAULT_OPENING_DAYS: DayOfWeek[] = [
  'MONDAY', 
  'TUESDAY', 
  'WEDNESDAY', 
  'THURSDAY', 
  'FRIDAY'
]
