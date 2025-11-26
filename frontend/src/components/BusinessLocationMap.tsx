import { MapContainer, Marker, TileLayer } from "react-leaflet";
import type { LocationDTO } from "../types/Location";

interface BusinessLocationMapProps {
  location: LocationDTO;
}

export default function BusinessLocationMap({ location }: BusinessLocationMapProps) {
  const position: [number, number] = [location.latitude, location.longitude];

  const handleOpenGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <div style={{ height: "320px", width: "100%" }}>
        <MapContainer center={position} zoom={15} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={position} />
        </MapContainer>
      </div>
      <button onClick={handleOpenGoogleMaps}>Ver en Google Maps</button>
    </div>
  );
}
