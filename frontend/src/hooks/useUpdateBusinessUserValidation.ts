// src/features/business/edit/common/validators.ts
export function isValidPhone(input: string): boolean {
  const clean = input.trim();
  if (clean === '') return true;
  const regex =
    /^\+?\d{1,3}(\s?9)?[\s(.-]*\d{1,4}[\s).-\s]*\d{2,4}[\s.-]?\d{3,4}$/;
  return regex.test(clean);
}


export function isValidEmail(input: string): boolean {
  const clean = input.trim()
  if (clean === '') return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean)
}

export function isValidSchedule(input: string): boolean {
  const clean = input.trim()
  if (clean === '') return true
  return /^([01]?\d|2[0-3]):[0-5]\d\s*[–-]\s*([01]?\d|2[0-3]):[0-5]\d$/.test(clean)
}

export function isValidLocation(input: string): boolean {
  const clean = input.trim()
  if (clean === '') return true
  return clean.length >= 4 && /[a-zA-Záéíóúñ\s,.-]+/.test(clean)
}

export function isNonNegativeNumber(v: unknown): boolean {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0
}


export type RestaurantErrors = Partial<{
  name: string
  description: string
  location: string
  phoneNumber: string
  publicEmail: string
  openingDays: string
  openingHours: string
  averagePrice: string
  restaurantType: string
  gallery: string
}>

type Price = '$'|'$$'|'$$$'
type RestaurantTypes = string

export function validateRestaurant(form: {
  name: string
  description: string
  location: string
  phoneNumber: string
  publicEmail: string
  openingDays: string[]
  openingHours: string[]        // ← líneas ya partidas
  averagePrice?: Price
  restaurantType?: RestaurantTypes
  uploadingPhotos: string[]
  existingPhotos: string[]
}): RestaurantErrors {
  const e: RestaurantErrors = {}
  if (!form.name.trim()) e.name = 'Requerido. Ej: “Parrilla Don Julio”'
  if (!form.description.trim()) e.description = 'Requerido. Breve descripción'
  if (!form.location.trim() || !isValidLocation(form.location)) e.location = 'Ubicación inválida. Ej: “Buenos Aires, Palermo”'
  if (form.phoneNumber && !isValidPhone(form.phoneNumber)) e.phoneNumber = 'Teléfono inválido. Ej: “+54 9 11 5555-5555”'
  if (form.publicEmail && !isValidEmail(form.publicEmail)) e.publicEmail = 'Email inválido. Ej: “contacto@mail.com”'
  if (!form.restaurantType) e.restaurantType = 'Seleccioná un tipo'
  if (!form.openingDays || form.openingDays.length === 0) e.openingDays = 'Elegí al menos un día'
  const hoursOk = form.openingHours.length > 0 && form.openingHours.every(h => isValidSchedule(h))
  if (!hoursOk) e.openingHours = 'Formato inválido. Ej: “09:00–18:00”'
  if (form.averagePrice && !['$','$$','$$$'].includes(form.averagePrice)) e.averagePrice = 'Valor inválido'
  const total = (form.existingPhotos?.length || 0) + (form.uploadingPhotos?.length || 0)
  if (total > 6) e.gallery = 'Máximo 6 fotos'
  return e
}



// src/features/business/edit/common/validateHotel.ts
export type HotelErrors = Partial<{
  name: string
  description: string
  location: string
  phoneNumber: string
  publicEmail: string
  hotelType: string
  gallery: string
}>

export function validateHotel(form: {
  name: string
  description: string
  location: string
  phoneNumber: string
  publicEmail: string
  hotelType?: string
  existingPhotos: string[]
  uploadingPhotos: string[]
}): HotelErrors {
  const e: HotelErrors = {}
  if (!form.name.trim()) e.name = 'Requerido. Ej: “Hotel Miramar”'
  if (!form.description.trim()) e.description = 'Requerido. Breve descripción'
  if (!form.location.trim() || !isValidLocation(form.location)) e.location = 'Ubicación inválida. Ej: “CABA, Recoleta”'
  if (form.phoneNumber && !isValidPhone(form.phoneNumber)) e.phoneNumber = 'Teléfono inválido. Ej: “+54 9 11 5555-5555”'
  if (form.publicEmail && !isValidEmail(form.publicEmail)) e.publicEmail = 'Email inválido. Ej: “reservas@mail.com”'
  if (!form.hotelType) e.hotelType = 'Seleccioná un tipo'
  const total = (form.existingPhotos?.length || 0) + (form.uploadingPhotos?.length || 0)
  if (total > 6) e.gallery = 'Máximo 6 fotos'
  return e
}
