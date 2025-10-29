// ---------------------- Validadores ----------------------

/**
 * Valida números de teléfono en varios formatos
 * Ejemplos válidos: +54 9 11 5555-5555, 1155555555, 11 5555 5555
 */
export function isValidPhone(input: string): boolean {
  const clean = input.trim()
  return /^(\+?\d{1,3}\s?)?(\d{2,4}[\s-]?)?\d{3,4}[\s-]?\d{3,4}$/.test(clean)
}

/**
 * Valida emails con formato simple
 * Ejemplo: usuario@dominio.com
 */
export function isValidEmail(input: string): boolean {
  const clean = input.trim()
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean)
}

/**
 * Valida horarios en formato "HH:MM–HH:MM" o "HH:MM-HH:MM"
 * Ejemplos válidos: "09:00–18:00", "9:00-18:00"
 */
export function isValidSchedule(input: string): boolean {
  const clean = input.trim()
  return /^([01]?\d|2[0-3]):[0-5]\d\s*[–-]\s*([01]?\d|2[0-3]):[0-5]\d$/.test(clean)
}

/**
 * Valida ubicaciones básicas
 * Debe contener al menos una palabra, coma o espacio
 * Ejemplo: "Buenos Aires, Palermo"
 */
export function isValidLocation(input: string): boolean {
  const clean = input.trim()
  return clean.length >= 4 && /[a-zA-Záéíóúñ\s,.-]+/.test(clean)
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
