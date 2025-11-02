import type { RestaurantType } from '../../../../types/Restaurant';
import type { HotelType } from '../../../../types/Hotel';

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
  'cafe', 'vegano', 'vegetariano', 'peruano', 'argento', 'italiano'
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
  'hotel',
  'hostel',
  'departamento',
  'cabaña',
  'camping',
  'LUJO',
];

export const HOTEL_TYPE_LABEL: Record<HotelType, string> = {
  hotel: 'Hotel',
  hostel: 'Hostel',
  departamento: 'Departamento',
  cabaña: 'Cabaña',
  camping: 'Camping',
  LUJO: 'Lujo',
};
