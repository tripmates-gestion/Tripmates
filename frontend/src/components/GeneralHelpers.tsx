import type { AttentionSchedule } from "../types/Business";


/**
 * Convierte una data URL (base64) a un objeto File
 * @param dataUrl - String en formato data:image/...;base64,xxx
 * @param filename - Nombre del archivo a generar
 * @returns File object listo para enviar al backend
 */
export function dataURLtoFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(',')
  const mimeMatch = arr[0].match(/:(.*?);/)
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}


/**
 * Parsea string de horario "09:00–18:00" o "09:00-18:00" a AttentionSchedule
 */
// eslint-disable-next-line react-refresh/only-export-components
export function parseHours(scheduleString: string): AttentionSchedule {
  const match = scheduleString.match(/([01]?\d|2[0-3]):[0-5]\d\s*[–-]\s*([01]?\d|2[0-3]):[0-5]\d/)
  if (!match) {
    // Fallback por defecto
    return { openingTime: '09:00', closingTime: '18:00' }
  }
  const [opening, closing] = match[0].split(/[–-]/).map((x) => x.trim())
  return { openingTime: opening, closingTime: closing }
}
