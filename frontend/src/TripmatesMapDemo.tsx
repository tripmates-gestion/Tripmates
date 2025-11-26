// TripmatesMapDemo.tsx
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import { useMemo } from "react";

const MAPTILER_KEY = "UHjZSSUL8xvlIQpi6qYm";

// Podés cambiar streets-v2 por el estilo que tengas en MapTiler:
// - streets-v2
// - basic-v2
// - pastel
// - hybrid
// - satellite
const MAPTILER_STYLE = "streets-v2";
const MAPTILER_URL = `https://api.maptiler.com/maps/${MAPTILER_STYLE}/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`;

// Mock de lugares (hoteles / restaurantes)
const MOCK_PLACES = [
  { id: 1, name: "Hotel Río Verde", type: "hotel", lat: -34.6033, lng: -58.3816, price: 120.654, rating: 4.5 },
  { id: 2, name: "Restó La Terraza", type: "restaurant", lat: -34.605, lng: -58.383, price: 88.888, rating: 4.2 },
  { id: 3, name: "Hostel Centro", type: "hotel", lat: -34.602, lng: -58.379, price: 55.321, rating: 4.0 },
  { id: 4, name: "Bar Nocturno", type: "restaurant", lat: -34.607, lng: -58.382, price: 34.999, rating: 4.6 },
  { id: 5, name: "Hotel Premium", type: "hotel", lat: -34.6045, lng: -58.378, price: 142.591, rating: 4.8 },
];

type Place = (typeof MOCK_PLACES)[number];

function createPriceIcon(place: Place, highlighted: boolean) {
  const bg = highlighted ? "#ffd600" : "#003b2f";
  const color = highlighted ? "#111827" : "#e5fdf5";

  return L.divIcon({
    className: "price-marker",
    html: `
      <div
        style="
          display:flex;
          align-items:center;
          justify-content:center;
          min-width:70px;
          padding:6px 10px;
          border-radius:999px;
          background:${bg};
          color:${color};
          font-weight:600;
          font-size:12px;
          box-shadow:0 4px 14px rgba(0,0,0,0.35);
          border:2px solid rgba(0,0,0,0.2);
          transform:translateY(-4px);
        "
      >
        $ ${place.price.toFixed(0)}
      </div>
    `,
    iconSize: [70, 32],
    iconAnchor: [35, 16],
  });
}

export default function TripmatesMapDemo() {
  const center: [number, number] = [-34.6037, -58.3816];
  const highlightedId = 1;

  const markers = useMemo(
    () =>
      MOCK_PLACES.map((place) => ({
        place,
        icon: createPriceIcon(place, place.id === highlightedId),
      })),
    []
  );

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* … tu barra superior + filtros igual que antes … */}

      <MapContainer
        center={center}
        zoom={14}
        style={{ width: "100%", height: "100%" }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; MapTiler & OpenStreetMap contributors'
          url={MAPTILER_URL}
        />

        {markers.map(({ place, icon }) => (
          <Marker
            key={place.id}
            position={[place.lat, place.lng]}
            icon={icon}
          />
        ))}
      </MapContainer>
    </div>
  );
}
