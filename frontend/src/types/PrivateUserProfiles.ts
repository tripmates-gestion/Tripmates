// Tipos base
import type { MenuItem } from "./Restaurant";
import type { RestaurantType } from "./Restaurant";

type Role = "USER" | "BUSINESS";
type BusinessType = "RESTAURANT" | "HOTEL";

export type CommonUser = {
  id: string;
  name: string;
  email: string;
  avatarURL?: string;
  role: Role;
  description?: string;
};

export type BusinessCommon = {
  id: string;
  name: string;
  email: string;
  avatarURL?: string;
  role: Role;
  businessType: BusinessType; // viene en /me
  description?: string;
  location?: string;
  phoneNumber?: string;
  publicEmail?: string;
  profileImageUrls?: string[];
  enabled?: boolean;
  averagePrice?: "$" | "$$" | "$$$";
};

// Especializaciones por tipo de negocio
export type RestaurantExtras = {
  restaurantType?: RestaurantType;
  openingDays?: string[]; // ["MONDAY", ...]
  attentionSchedule?: {
    openingTime: { hour: number; minute: number };
    closingTime: { hour: number; minute: number };
  };
  menu?: MenuItem[];
};

type HotelExtras = {
  hotelType?: string;
  roomPacks?: Array<{
    checkInDate: string;  // ISO
    checkOutDate: string; // ISO
    numberOfGuests: number;
    services?: string[];
    price: number;
    description?: string;
    photosURLs?: string[];
  }>;
};

// Uniones finales
export type BusinessUser =
  | (BusinessCommon & { businessType: "RESTAURANT" } & RestaurantExtras)
  | (BusinessCommon & { businessType: "HOTEL" } & HotelExtras);


export type CurrentUser = CommonUser | BusinessUser;
