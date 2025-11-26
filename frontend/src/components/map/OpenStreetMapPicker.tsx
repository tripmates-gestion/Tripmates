import { useCallback, useEffect, useRef, useState } from 'react'
import { Box, Typography } from '@mui/material'
import type { LocationDTO } from '../../types/Location'

declare global {
  interface Window {
    L?: any
  }
}

const LEAFLET_SCRIPT = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
const LEAFLET_STYLES = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'

let leafletLoader: Promise<LeafletLib> | null = null

type LeafletMap = {
  remove: () => void
  setView: (coords: [number, number], zoom?: number) => void
  on: (event: string, handler: (event: LeafletClickEvent) => void) => void
}

type LeafletMarker = {
  setLatLng: (coords: [number, number]) => void
  addTo: (map: LeafletMap) => LeafletMarker
}

type LeafletLib = {
  map: (container: HTMLElement, options: Record<string, unknown>) => LeafletMap
  tileLayer: (url: string, options: Record<string, unknown>) => { addTo: (map: LeafletMap) => void }
  marker: (coords: [number, number]) => LeafletMarker
}

type LeafletClickEvent = { latlng: { lat: number; lng: number } }

const hasValidCoords = (loc: LocationDTO) => {
  return (
    Number.isFinite(loc.latitude) &&
    Number.isFinite(loc.longitude) &&
    !(loc.latitude === 0 && loc.longitude === 0)
  )
}

function loadLeaflet(): Promise<LeafletLib> {
  if (window.L) return Promise.resolve(window.L as LeafletLib)
  if (leafletLoader) return leafletLoader

  leafletLoader = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${LEAFLET_SCRIPT}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve(window.L as LeafletLib))
      existing.addEventListener('error', reject)
      return
    }

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = LEAFLET_STYLES
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = LEAFLET_SCRIPT
    script.async = true
    script.onload = () => resolve(window.L as LeafletLib)
    script.onerror = reject
    document.body.appendChild(script)
  })

  return leafletLoader
}

type Props = {
  location: LocationDTO
  onChange: (value: LocationDTO) => void
  disabled?: boolean
  height?: number
  /**
   * When false, the map is only used to visualize the current location and
   * clicks will not move the marker nor trigger onChange.
   */
  interactive?: boolean
}

const DEFAULT_CENTER: [number, number] = [-34.6037, -58.3816]

export function OpenStreetMapPicker({ location, onChange, disabled = false, height = 260, interactive = true }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markerRef = useRef<LeafletMarker | null>(null)
  const leafletRef = useRef<LeafletLib | null>(null)
  const locationRef = useRef<LocationDTO>(location)
  const [error, setError] = useState<string | null>(null)

  const updateMarker = useCallback((loc: LocationDTO, zoom = 14) => {
    if (!mapRef.current || !leafletRef.current) return

    if (hasValidCoords(loc)) {
      const coords: [number, number] = [loc.latitude, loc.longitude]
      mapRef.current.setView(coords, zoom)
      if (!markerRef.current) {
        markerRef.current = leafletRef.current.marker(coords).addTo(mapRef.current)
      } else {
        markerRef.current.setLatLng(coords)
      }
    } else {
      mapRef.current.setView(DEFAULT_CENTER, 12)
    }
  }, [])

  useEffect(() => {
    locationRef.current = location
  }, [location])

  useEffect(() => {
    let cancelled = false

    loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current || mapRef.current) return

        leafletRef.current = L
        mapRef.current = L.map(containerRef.current, {
          center: DEFAULT_CENTER,
          zoom: 12,
          zoomControl: true,
        })

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(mapRef.current)

        if (interactive) {
          mapRef.current.on('click', (e: LeafletClickEvent) => {
            if (disabled) return
            const { lat, lng } = e.latlng
            if (!markerRef.current) {
              markerRef.current = L.marker([lat, lng]).addTo(mapRef.current)
            } else {
              markerRef.current.setLatLng([lat, lng])
            }
            onChange({ ...locationRef.current, latitude: lat, longitude: lng })
          })
        }

        updateMarker(locationRef.current)
      })
      .catch(() => {
        if (cancelled) return
        setError('No se pudo cargar el mapa de OpenStreetMap')
      })

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
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Seleccioná una ubicación sobre el mapa (OpenStreetMap)
      </Typography>
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
