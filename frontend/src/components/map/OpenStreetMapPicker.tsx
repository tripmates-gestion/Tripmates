import { useCallback, useEffect, useRef, useState } from 'react'
import { Box, Typography } from '@mui/material'
import type { LocationDTO } from '../../types/Location'
import maplibregl, { Map as MapLibreMap, Marker } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const MAPTILER_API_KEY = 'UHjZSSUL8xvlIQpi6qYm'
const MAPTILER_STYLE_ID = 'streets-v2'
const MAPTILER_STYLE_URL = `https://api.maptiler.com/maps/${MAPTILER_STYLE_ID}/style.json?key=${MAPTILER_API_KEY}`

type Props = {
  location: LocationDTO
  onChange: (value: LocationDTO) => void
  disabled?: boolean
  height?: number
  interactive?: boolean
}

const DEFAULT_CENTER: [number, number] = [-34.6037, -58.3816] // [lat, lng]

const hasValidCoords = (loc: LocationDTO) => {
  return (
    Number.isFinite(loc.latitude) &&
    Number.isFinite(loc.longitude) &&
    !(loc.latitude === 0 && loc.longitude === 0)
  )
}

export function OpenStreetMapPicker({
  location,
  onChange,
  disabled = false,
  height = 360,
  interactive = true,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const markerRef = useRef<Marker | null>(null)
  const locationRef = useRef<LocationDTO>(location)
  const [error, setError] = useState<string | null>(null)

  const updateMarker = useCallback(
    (loc: LocationDTO, zoom = 16) => {
      if (!mapRef.current) return

      if (hasValidCoords(loc)) {
        const lngLat: [number, number] = [loc.longitude, loc.latitude]
        mapRef.current.setCenter(lngLat)
        mapRef.current.setZoom(zoom)

        if (!markerRef.current) {
          markerRef.current = new maplibregl.Marker().setLngLat(lngLat).addTo(mapRef.current)
        } else {
          markerRef.current.setLngLat(lngLat)
        }
      } else {
        const lngLat: [number, number] = [DEFAULT_CENTER[1], DEFAULT_CENTER[0]]
        mapRef.current.setCenter(lngLat)
        mapRef.current.setZoom(12)
      }
    },
    []
  )

  useEffect(() => {
    locationRef.current = location
  }, [location])

  useEffect(() => {
    let cancelled = false

    if (!MAPTILER_API_KEY) {
      setError('Falta la API key de MapTiler para cargar el mapa')
      return
    }

    if (mapRef.current || !containerRef.current) return

    try {
      mapRef.current = new maplibregl.Map({
        container: containerRef.current,
        style: MAPTILER_STYLE_URL,
        center: [DEFAULT_CENTER[1], DEFAULT_CENTER[0]], // [lng, lat]
        zoom: 14,
      })

      // Controles de zoom
      mapRef.current.addControl(new maplibregl.NavigationControl(), 'top-right')

      // Click para mover marcador
      if (interactive) {
        mapRef.current.on('click', (e) => {
          if (disabled) return
          const { lng, lat } = e.lngLat

          if (!markerRef.current && mapRef.current) {
            markerRef.current = new maplibregl.Marker().setLngLat([lng, lat]).addTo(mapRef.current)
          } else if (markerRef.current) {
            markerRef.current.setLngLat([lng, lat])
          }

          onChange({ ...locationRef.current, latitude: lat, longitude: lng })
        })
      }

      mapRef.current.on('load', () => {
        if (cancelled) return
        updateMarker(locationRef.current)
      })
    } catch (err) {
      console.error(err)
      if (!cancelled) setError('No se pudo cargar el mapa')
    }

    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
      markerRef.current = null
    }
  }, [disabled, interactive, onChange, updateMarker])

  useEffect(() => {
    updateMarker(location)
  }, [location, updateMarker])

  return (
    <Box>
      {interactive && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Seleccioná una ubicación sobre el mapa
        </Typography>
      )}
      <Box
        ref={containerRef}
        sx={{
          height,
          width: '100%',
          borderRadius: 1,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          backgroundColor: 'background.paper',
          opacity: disabled ? 0.7 : 1,
          pointerEvents: disabled ? 'none' : 'auto',
        }}
      />
      {error && (
        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  )
}

export default OpenStreetMapPicker
