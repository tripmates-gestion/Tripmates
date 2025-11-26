import { useState } from "react";
import BusinessLocationPicker from "../components/BusinessLocationPicker";
import type { BusinessAccountDTO, LocationDTO } from "../types/Location";

async function saveBusinessLocation(
  businessId: string,
  location: LocationDTO
): Promise<void> {
  await fetch(`/api/business/${businessId}/location`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      location: {
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
      },
    }),
  });
}

const MOCK_BUSINESS: BusinessAccountDTO = {
  id: "business-123",
  name: "Restaurante Demo",
  description: "Ejemplo de negocio para editar ubicación.",
  location: {
    address: "Av. Siempre Viva 742, Springfield",
    latitude: -34.6037,
    longitude: -58.3816,
  },
};

export default function BusinessEditPage() {
  const [business, setBusiness] = useState<BusinessAccountDTO>(MOCK_BUSINESS);

  const handleLocationChange = (location: LocationDTO) => {
    setBusiness((prev) => ({ ...prev, location }));
  };

  const handleSaveLocation = async (location: LocationDTO) => {
    await saveBusinessLocation(business.id, location);
    alert("Ubicación guardada");
  };

  return (
    <div style={{ display: "grid", gap: "16px", padding: "16px" }}>
      <h1>Editar negocio</h1>
      <p>{business.name}</p>

      <BusinessLocationPicker
        initialLocation={business.location}
        onLocationChange={handleLocationChange}
        onSave={handleSaveLocation}
      />
    </div>
  );
}
