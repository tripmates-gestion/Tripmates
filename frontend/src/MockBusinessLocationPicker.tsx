// MockBusinessLocationPicker.tsx
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { useRef, useState } from "react";
import type { Marker as LeafletMarker } from "leaflet";

export default function MockBusinessLocationPicker() {
  const [lat, setLat] = useState(-34.6037389);
  const [lng, setLng] = useState(-58.3815704);
  const markerRef = useRef<LeafletMarker | null>(null);

  const position: [number, number] = [lat, lng];

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Seleccionar ubicación</h2>
      <p>Arrastrá el pin para elegir la ubicación del negocio.</p>

      <div
        style={{
          width: "100%",
          height: "350px",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0px 4px 10px rgba(0,0,0,0.15)",
        }}
      >
        <MapContainer
          center={position}
          zoom={15}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker
            draggable
            position={position}
            ref={markerRef}
            eventHandlers={{
              dragend: () => {
                const marker = markerRef.current;
                if (!marker) return;
                const { lat, lng } = marker.getLatLng();
                setLat(lat);
                setLng(lng);
              },
            }}
          />

              

        </MapContainer>
      </div>

      <pre style={{ marginTop: "10px", background: "#eee", padding: "10px" }}>
        lat: {lat.toFixed(6)}{" "}\nlng:{lng.toFixed(6)}
      </pre>
    </div>
  );
}
