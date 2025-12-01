import { useCallback, useState } from 'react'

type GeocodeResult = {
  latitude: number
  longitude: number
}

const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/search'

export function useGeocodeAddress() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const geocodeAddress = useCallback(async (address: string): Promise<GeocodeResult | null> => {
    if (!address?.trim()) {
      setError('Ingresá una dirección para buscar.')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const url = `${NOMINATIM_ENDPOINT}?format=json&limit=1&q=${encodeURIComponent(address)}`

      console.log('Geocoding URL:', url)
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Tripmates/1.0 (Universidad)'
        }
      })

      if (!response.ok) {
        throw new Error('Geocoding request failed')
      }

      const data = await response.json()

      if (!Array.isArray(data) || data.length === 0) {
        setError('No encontramos esa dirección. Probá con otra referencia cercana.')
        return null
      }

      const { lat, lon } = data[0] as { lat?: string; lon?: string }
      const latitude = Number.parseFloat(lat ?? '')
      const longitude = Number.parseFloat(lon ?? '')

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        setError('No pudimos interpretar las coordenadas devueltas.')
        return null
      }

      return { latitude, longitude }
    } catch (err) {
      console.error('Error geocoding address', err)
      setError('Hubo un problema al buscar la dirección. Intentá nuevamente.')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    geocodeAddress,
    loading,
    error,
    setError,
  }
}

export default useGeocodeAddress
