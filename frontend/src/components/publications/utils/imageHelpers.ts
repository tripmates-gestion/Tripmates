
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
