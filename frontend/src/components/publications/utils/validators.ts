import type { LocationDTO } from '../../types/Location'

// ---------------------- Validadores ----------------------

/**
 * Valida números de teléfono en varios formatos
 * Ejemplos válidos: +54 9 11 5555-5555, 1155555555, 11 5555 5555
 */
export function isValidPhone(input: string): boolean {
  const clean = input.trim()
  if (clean === '') return true
  return /^(\+?\d{1,3}\s?)?(\d{2,4}[\s-]?)?\d{3,4}[\s-]?\d{3,4}$/.test(clean)
}

/**
 * Valida emails con formato simple
 * Ejemplo: usuario@dominio.com
 */
export function isValidEmail(input: string): boolean {
  const clean = input.trim()
  if (clean === '') return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean)
}

/**
 * Valida horarios en formato "HH:MM–HH:MM" o "HH:MM-HH:MM"
 * Ejemplos válidos: "09:00–18:00", "9:00-18:00"
 */
export function isValidSchedule(input: string): boolean {
  const clean = input.trim()
  if (clean === '') return true
  return /^([01]?\d|2[0-3]):[0-5]\d\s*[–-]\s*([01]?\d|2[0-3]):[0-5]\d$/.test(clean)
}

export type LocationFieldError = Partial<{
  address: string
  latitude: string
  longitude: string
}>

function hasCoordinates(value?: number) {
  return typeof value === 'number' && !Number.isNaN(value)
}

export function validateLocation(
  location: LocationDTO | undefined,
  { required = false }: { required?: boolean } = {}
): LocationFieldError | undefined {
  const errors: LocationFieldError = {}

  const hasAnyValue = Boolean(location?.address?.trim()) || hasCoordinates(location?.latitude) || hasCoordinates(location?.longitude)

  if (!required && !hasAnyValue) return undefined

  if (!location?.address?.trim()) {
    errors.address = 'Ingresá una ciudad o dirección'
  } else if (location.address.trim().length < 3) {
    errors.address = 'La ubicación debe tener al menos 3 caracteres'
  }

  const lat = location?.latitude
  if (!hasCoordinates(lat)) {
    errors.latitude = 'Ingresá una latitud válida'
  } else if (lat! < -90 || lat! > 90) {
    errors.latitude = 'La latitud debe estar entre -90 y 90'
  }

  const lng = location?.longitude
  if (!hasCoordinates(lng)) {
    errors.longitude = 'Ingresá una longitud válida'
  } else if (lng! < -180 || lng! > 180) {
    errors.longitude = 'La longitud debe estar entre -180 y 180'
  }

  return Object.keys(errors).length > 0 ? errors : undefined
}

export function isValidLocation(location: LocationDTO | undefined): boolean {
  return !validateLocation(location, { required: true })
}

/**
 * Valida fechas en formato YYYY-MM-DD
 * Ejemplos válidos: "2023-12-31", "2024-01-01"
 */
export function isValidDate(input: string): boolean {
  const clean = input.trim();
  // Verifica el formato básico YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return false;
  }
  
  // Verifica que sea una fecha válida
  const date = new Date(clean);
  return !isNaN(date.getTime());
}
