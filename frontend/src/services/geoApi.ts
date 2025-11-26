// Placeholder geocoding service. Replace with a real provider (MapTiler, Mapbox, Nominatim, etc.).
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const trimmed = address.trim();
  if (!trimmed) {
    return null;
  }

  // TODO: Integrate a real geocoding API here.
  return {
    lat: -34.6037,
    lng: -58.3816,
  };
}
