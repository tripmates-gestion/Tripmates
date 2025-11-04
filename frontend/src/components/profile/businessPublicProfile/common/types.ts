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

export type RestaurantTypes = 'CAFE'|'VEGANO'|'VEGETARIANO'|'PERUANO'|'ARGENTINO'|'ITALIANO';
export const RESTAURANT_TYPE_OPTIONS: RestaurantTypes[] = [
  'CAFE','VEGANO','VEGETARIANO','PERUANO','ARGENTINO','ITALIANO'
];

export type RestaurantForm = BusinessCommonForm & {
  openingDays: string[];
  openingHours: string;
  averagePrice?: '$'|'$$'|'$$$';
  restaurantType?: RestaurantTypes;
};

export type HotelForm = BusinessCommonForm & {
  // extensible: hotelType, roomPacks, etc.
  hotelType?: string;
};

export const PRICE_OPTIONS = ['$', '$$', '$$$'] as const;
export const MAX_GALLERY_IMAGES = 10;


// ====== ENUMS HOTEL ======
export type HotelType =
  | 'HOSTEL'
  | 'BOUTIQUE'
  | 'SPA'
  | 'RESORT'
  | 'BUSINESS'
  | 'APART'
  | 'BED_AND_BREAKFAST';

export const HOTEL_TYPE_OPTIONS: HotelType[] = [
  'HOSTEL',
  'BOUTIQUE',
  'SPA',
  'RESORT',
  'BUSINESS',
  'APART',
  'BED_AND_BREAKFAST',
];

export const HOTEL_TYPE_LABEL: Record<HotelType, string> = {
  HOSTEL: 'Hostel',
  BOUTIQUE: 'Boutique',
  SPA: 'Spa',
  RESORT: 'Resort',
  BUSINESS: 'Business/Corporativo',
  APART: 'Apart/Departamento',
  BED_AND_BREAKFAST: 'Bed & Breakfast',
};