import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import type { LatLngExpression, LeafletMouseEvent } from "leaflet";
import { geocodeAddress } from "../services/geoApi";
import { DEFAULT_LOCATION, type LocationDTO } from "../types/Location";

function RecenterOnLocation({ position }: { position: LatLngExpression }) {
  const map = useMap();

  useEffect(() => {
    map.setView(position);
  }, [map, position]);

  return null;
}

interface BusinessLocationPickerProps {
  initialLocation?: LocationDTO;
  onLocationChange: (location: LocationDTO) => void;
  onSave: (location: LocationDTO) => Promise<void> | void;
  showSaveButton?: boolean;
}

export default function BusinessLocationPicker({
  initialLocation,
  onLocationChange,
  onSave,
}: BusinessLocationPickerProps) {
  const [location, setLocation] = useState<LocationDTO>(
    () => initialLocation ?? { ...DEFAULT_LOCATION }
  );
  const [error, setError] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const center = useMemo<LatLngExpression>(
    () => [location.latitude, location.longitude],
    [location.latitude, location.longitude]
  );

  useEffect(() => {
    onLocationChange(location);
  }, [location, onLocationChange]);

  const handleMarkerDragEnd = (event: LeafletMouseEvent) => {
    const { lat, lng } = event.latlng;
    const updated = { ...location, latitude: lat, longitude: lng };
    setLocation(updated);
    onLocationChange(updated);
  };

  const handleAddressChange = (event: ChangeEvent<HTMLInputElement>) => {
    const updated = { ...location, address: event.target.value };
    setLocation(updated);
  };

  const handleGeocode = async () => {
    const result = await geocodeAddress(location.address);
    if (!result) {
      setError("No se pudo geocodificar la dirección. Intenta nuevamente.");
      return;
    }

    setError("");
    const updated = {
      ...location,
      latitude: result.lat,
      longitude: result.lng,
    };
    setLocation(updated);
    onLocationChange(updated);
  };

  const handleSaveClick = async () => {
    setIsSaving(true);
    try {
      await onSave(location);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <label style={{ display: "grid", gap: "4px" }}>
        <span>Dirección</span>
        <input
          type="text"
          value={location.address}
          onChange={handleAddressChange}
          placeholder="Ingresa la dirección"
          style={{ padding: "8px", fontSize: "14px" }}
        />
      </label>

      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <button onClick={handleGeocode}>Buscar en mapa</button>
        {error && <span style={{ color: "#c0392b" }}>{error}</span>}
      </div>

      <div style={{ height: "320px", width: "100%" }}>
        <MapContainer center={center} zoom={14} style={{ height: "100%", width: "100%" }}>
          <RecenterOnLocation position={center} />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={center} draggable eventHandlers={{ dragend: handleMarkerDragEnd }} />
        </MapContainer>
      </div>

      {showSaveButton !== false && (
        <button onClick={handleSaveClick} disabled={isSaving}>
          {isSaving ? "Guardando..." : "Guardar ubicación"}
        </button>
      )}
    </div>
  );
}
