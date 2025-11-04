import React, { useCallback, useEffect, useState } from "react";
import { BusinessProfileContext } from "./BusinessProfileContext";
import { useAuth } from "../hooks/useAuth";
import { getCurrentUser } from "../services/userService";
import type { BusinessUser } from "./PrivateUserProfilesTypes";
import {ACCOUNT_TYPES, BUSINESS_TYPES} from "../constants/Rol";

// Helpers bien chicos para mapear en forma segura
function mapToRestaurantUser(raw: any): BusinessUser {
  return {
    id: raw.id,
    username: raw.username,
    name: raw.name,
    email: raw.email,
    avatarURL: raw.avatarURL,
    role: ACCOUNT_TYPES.business,
    businessType: BUSINESS_TYPES.restaurant,
    description: raw.description,
    location: raw.location,
    phoneNumber: raw.phoneNumber,
    publicEmail: raw.publicEmail,
    profileImageUrls: raw.profileImageUrls ?? [],
    enabled: raw.enabled,

    // extras de restaurante:
    averagePrice: raw.averagePrice,              // "$" | "$$" | "$$$"
    restaurantType: raw.restaurantType,
    openingDays: raw.openingDays ?? [],
    attentionSchedule: raw.attentionSchedule ?? undefined,
    menu: raw.menu ?? [],
  };
}

function mapToHotelUser(raw: any): BusinessUser {
  return {
    id: raw.id,
    username: raw.username,
    name: raw.name,
    email: raw.email,
    avatarURL: raw.avatarURL,
    role: ACCOUNT_TYPES.business,
    businessType: BUSINESS_TYPES.hotel,
    description: raw.description,
    location: raw.location,
    phoneNumber: raw.phoneNumber,
    publicEmail: raw.publicEmail,
    profileImageUrls: raw.profileImageUrls ?? [],
    enabled: raw.enabled,

    // extras de hotel:
    hotelType: raw.hotelType,
    roomPacks: raw.roomPacks ?? [],
  };
}

export const BusinessProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { accessToken, user } = useAuth();

  const [business, setBusiness] = useState<BusinessUser | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshProfile = useCallback(async () => {
    if (!accessToken) return;

    // si no es negocio, el contexto de negocio queda vacío
    if (!user || user.role !== ACCOUNT_TYPES.business) {
      setBusiness(null);
      return;
    }

    setLoading(true);
    try {
      const raw = await getCurrentUser(accessToken); // llamamos a /user/me que devuelve todo
      
      // discriminamos por tipo de negocio
      console.log("[BusinessProfile] Refreshing business profile...");
      let mapped: BusinessUser;
      if (raw.businessType === BUSINESS_TYPES.restaurant) {
        mapped = mapToRestaurantUser(raw);

      } else if (raw.businessType === BUSINESS_TYPES.hotel) {
        mapped = mapToHotelUser(raw);

      } else {
        // si el back devolviera algo inesperado
        console.warn("[BusinessProfile] businessType desconocido:", raw.businessType);
        setBusiness(null);
        return;

      }
      
      console.log("[BusinessProfile] Business profile refreshed:", mapped);
      setBusiness(mapped);
    } catch (err) {
      console.error("[BusinessProfile] Error al refrescar perfil:", err);

    } finally {
      setLoading(false);

    }
  }, [accessToken, user?.role]);

  useEffect(() => {
    if (!accessToken) {
      setBusiness(null);
      return;
    }
    void refreshProfile();
  }, [accessToken, user?.role, refreshProfile]);

  return (
    <BusinessProfileContext.Provider
      value={{ business, setBusiness, refreshProfile, loading }}
    >
      {children}
    </BusinessProfileContext.Provider>
  );
};
