import { useCallback, useState } from 'react'

const NOMINATIM_REVERSE_ENDPOINT = 'https://nominatim.openstreetmap.org/reverse'

type ReverseGeocodeResponse = {
  address?: Record<string, string | undefined>
  display_name?: string
}

const formatAddress = (address?: ReverseGeocodeResponse['address']) => {
  if (!address) return null

  const road = address.road ?? ''
  const houseNumber = address.house_number ?? ''
  const city = address.city ?? address.town ?? address.village ?? address.hamlet ?? ''
  const state = address.state ?? address.region ?? ''
  const country = address.country ?? ''

  const streetPart = [road, houseNumber].filter(Boolean).join(' ').trim()
  const cityStatePart = [city, state].filter(Boolean).join(' ').trim()

  const parts = [streetPart, cityStatePart, country].filter(Boolean)

  if (parts.length === 0) return null

  return parts.join(', ')
}

export function useReverseGeocode() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string | null> => {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setError('Coordenadas inválidas para buscar la dirección.')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const url = `${NOMINATIM_REVERSE_ENDPOINT}?format=json&addressdetails=1&lat=${lat}&lon=${lng}`

      console.log('Reverse geocoding URL:', url)

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Tripmates/1.0 (Universidad)'
        }
      })

      if (!response.ok) {
        throw new Error('Reverse geocoding request failed')
      }

      const data = (await response.json()) as ReverseGeocodeResponse
      const formattedAddress = formatAddress(data.address) ?? data.display_name ?? null

      if (!formattedAddress) {
        setError('No pudimos obtener una dirección para esas coordenadas.')
        return null
      }

      return formattedAddress
    } catch (err) {
      console.error('Error reverse geocoding address', err)
      setError('Hubo un problema al buscar la dirección. Intentá nuevamente.')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    reverseGeocode,
    loading,
    error,
    setError,
  }
}

export default useReverseGeocode
