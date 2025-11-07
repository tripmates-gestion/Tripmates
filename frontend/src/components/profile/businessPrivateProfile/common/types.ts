import type { RestaurantType } from '../../../../types/Restaurant';
import type { HotelType, HotelService } from '../../../../types/Hotel';

export type TimeLike = string | { hour?: number; minute?: number | null } | null | undefined;

export type BusinessCommonForm = {
  name: string;
  description: string;
  location: string;
  phoneNumber: string;
  publicEmail: string;
  avatarUrl?: string;
  avatar?: string | null;

  // galería
  existingPhotos: string[];
  uploadingPhotos: string[];
};


export const RESTAURANT_TYPE_OPTIONS: RestaurantType[] = [
  'Cafe', 'Vegano', 'Vegetariano', 'Peruano', 'Argentino', 'Italiano'
];

export type RestaurantForm = BusinessCommonForm & {
  openingDays: string[];
  openingHours: string;
  averagePrice?: '$'|'$$'|'$$$';
  restaurantType?: RestaurantType;
};

export type HotelForm = BusinessCommonForm & {
  // extensible: hotelType, roomPacks, etc.
  hotelType?: string;
};

export const PRICE_OPTIONS = ['$', '$$', '$$$'] as const;
export const MAX_GALLERY_IMAGES = 10;


// ====== ENUMS HOTEL ======
export const HOTEL_TYPE_OPTIONS: HotelType[] = [
  'Hotel',
  'Hostel',
  'Departamento',
  'Cabaña',
  'Camping',
  'Lujo',
];

export const HOTEL_TYPE_LABEL: Record<HotelType, string> = {
  Hotel: 'Hotel',
  Hostel: 'Hostel',
  Departamento: 'Departamento',
  Cabaña: 'Cabaña',
  Camping: 'Camping',
  Lujo: 'Lujo',
};


// Opciones y labels “lindos” para mostrar
export const HOTEL_SERVICE_OPTIONS: HotelService[] = [
  "wifi",
  "desayuno",
  "piscina",
  "gimnasio",
  "estacionamiento",
  "spa",
  "restaurante",
  "bar",
  "aire_acondicionado",
  "transporte_aeropuerto",
  "admite_mascotas",
  "servicio_habitaciones",
  "lavanderia",
  "centro_negocios",
  "sala_reuniones",
  "club_infantil",
  "vista_al_mar",
  "todo_incluido",
];

export const HOTEL_SERVICE_LABEL: Record<HotelService, string> = {
  wifi: "Wi-Fi",
  desayuno: "Desayuno",
  piscina: "Piscina",
  gimnasio: "Gimnasio",
  estacionamiento: "Estacionamiento",
  spa: "Spa",
  restaurante: "Restaurante",
  bar: "Bar",
  aire_acondicionado: "Aire acondicionado",
  transporte_aeropuerto: "Transporte al aeropuerto",
  admite_mascotas: "Admite mascotas",
  servicio_habitaciones: "Servicio a la habitación",
  lavanderia: "Lavandería",
  centro_negocios: "Centro de negocios",
  sala_reuniones: "Sala de reuniones",
  club_infantil: "Club infantil",
  vista_al_mar: "Vista al mar",
  todo_incluido: "Todo incluido",
};