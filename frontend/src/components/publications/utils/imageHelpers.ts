export const FILE_CONFIG = {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as string[],
    maxSizeMB: 5 * 1024 * 1024,
    maxFilesPerPost: 6,
  } as const
  

// ---------------------- Validación de imágenes ----------------------

/**
 * Valida que un archivo sea una imagen válida
 * @throws Error si el archivo no es válido
 */
export function validateFile(file: File): void {
  if (!FILE_CONFIG.allowedMimeTypes.includes(file.type)) {
    throw new Error('Formato no permitido. Solo se admiten JPG, PNG y WebP.')
  }
  if (file.size > FILE_CONFIG.maxSizeMB) {
    throw new Error(`La imagen supera el tamaño máximo de ${FILE_CONFIG.maxSizeMB}MB.`)
  }
}

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
 * Lee un archivo y lo convierte a data URL (base64)
 * Útil para previews de imágenes
 */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
