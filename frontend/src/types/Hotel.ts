export type HotelType = "Hotel" | "Hostel" | "Departamento" | "Cabaña" | "Camping" | "Lujo"
export type HotelService = "wifi" | "desayuno" | "piscina" | "gimnasio" | "estacionamiento" | "spa" | "restaurante" | "bar" | "aire_acondicionado" | "transporte_aeropuerto" | "admite_mascotas" | "servicio_habitaciones" | "lavanderia" | "centro_negocios" | "sala_reuniones" | "club_infantil" | "vista_al_mar" | "todo_incluido"

// Paquete de habitación que devuelve el backend
export type RoomPack = {
  checkInDate: string;       // "2025-11-15"
  checkOutDate: string;      // "2025-11-18"
  numberOfGuests: number;    // 3
  services?: string[];        // ["breakfast", "gym"]
  price: number;             // 310
  description?: string;       // "Premium suite"
  photosURLs?: string[];     // URLs de las fotos ya guardadas
};



// Payload que mandamos en data (sin fotos)
export type RoomPackPayload = Omit<RoomPack, "photosURLs">;
  