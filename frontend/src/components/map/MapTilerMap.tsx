// src/components/map/MapTilerMap.tsx
import { useEffect, useRef } from 'react';
import * as maptilersdk from '@maptiler/sdk';

// Initialize MapTiler SDK
maptilersdk.config.apiKey = 'YOUR_MAPTILER_API_KEY'; // You'll need to get this from MapTiler

interface MapTilerMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  markerTitle?: string;
  className?: string;
}

export const MapTilerMap = ({
  latitude,
  longitude,
  zoom = 15,
  markerTitle = 'Location',
  className = 'h-64 w-full',
}: MapTilerMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maptilersdk.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    if (!map.current) {
      map.current = new maptilersdk.Map({
        container: mapContainer.current,
        style: maptilersdk.MapStyle.STREETS,
        center: [longitude, latitude],
        zoom,
      });

      new maptilersdk.Marker({ color: '#FF6B6B' })
        .setLngLat([longitude, latitude])
        .setPopup(new maptilersdk.Popup().setHTML(`<h3>${markerTitle}</h3>`))
        .addTo(map.current);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [latitude, longitude, zoom, markerTitle]);

  return <div ref={mapContainer} className={className} />;
};