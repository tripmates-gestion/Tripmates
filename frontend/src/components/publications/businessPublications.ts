import type {
  BusinessPublicationRequestDTO,
  BusinessPublicationResponseDTO,
} from '../../types/business'

// ---------------------- API Client ----------------------

const API_BASE_URL = 'http://localhost:8080'

/**
 * Crea una nueva publicación de negocio
 * @param data - Datos de la publicación
 * @param files - Archivos de imágenes a subir
 * @param accessToken - Token de autenticación
 * @param signal - AbortSignal para cancelar la petición
 * @returns Datos de la publicación creada
 * @throws Error si falla la creación o si no hay token
 */
export async function createBusinessPublication(
  data: BusinessPublicationRequestDTO,
  files: File[],
  accessToken: string | null,
  signal?: AbortSignal
): Promise<BusinessPublicationResponseDTO> {
  if (!accessToken) {
    throw new Error('No estás autenticado.')
  }

  const formData = new FormData()
  
  // Agregar el JSON como Blob (necesario para multipart/form-data)
  formData.append(
    'data',
    new Blob([JSON.stringify(data)], { type: 'application/json' }),
    'data.json'
  )

  // Agregar archivos con la clave 'files'
  for (const file of files) {
    formData.append('files', file, file.name)
  }

  
  const response = await fetch(`${API_BASE_URL}/publications/business`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      // NO setear Content-Type, el browser lo hace automáticamente con boundary
    },
    body: formData,
    signal,
  })

  // Intentar parsear la respuesta
  const text = await response.text().catch(() => '')
  let payload: any = null
  try {
    payload = text ? JSON.parse(text) : null
  } catch {
    // No es JSON válido
  }

  if (!response.ok) {
    const errorMsg =
      (payload && (payload.message || payload.error)) ||
      text ||
      `Error HTTP ${response.status}`
    throw new Error(errorMsg)
  }

  return payload as BusinessPublicationResponseDTO
}

/**
 * Obtiene todas las publicaciones de negocios (ejemplo para futuro)
 */
export async function getBusinessPublications(
  accessToken: string | null
): Promise<BusinessPublicationResponseDTO[]> {
  if (!accessToken) {
    throw new Error('No estás autenticado.')
  }

  const response = await fetch(`${API_BASE_URL}/publications/business`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Error al obtener publicaciones: ${response.status}`)
  }

  return response.json()
}
