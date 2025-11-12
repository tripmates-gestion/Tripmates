import type { CurrentUser } from '../../types/PrivateUserProfiles';
import { ACCOUNT_TYPES, BUSINESS_TYPES } from '../../constants/Rol';

export function mapUser(raw: any): CurrentUser {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid user raw');
  }
  console.log("[UserMapper] Mapping user recived from GET user/me", raw);

  const base = {
    id: raw.id,
    username: raw.username,
    name: raw.name,
    email: raw.email,
    avatarURL: raw.avatarURL,
    description: raw.description,
  };

  if (raw.role === ACCOUNT_TYPES.business) {
    const commonBiz = {
      ...base,
      role: ACCOUNT_TYPES.business,
      businessType: raw.businessType, // "RESTAURANT"/"LODGING"
      description: raw.description,
      location: raw.location,
      phoneNumber: raw.phoneNumber,
      publicEmail: raw.publicEmail,
      profileImageUrls: raw.profileImageUrls ?? [],
      enabled: !!raw.enabled,
    };
    if (raw.businessType === BUSINESS_TYPES.restaurant) {
      return {
        ...commonBiz,
        businessType: BUSINESS_TYPES.restaurant,
        averagePrice: raw.averagePrice,
        restaurantType: raw.restaurantType,
        openingDays: raw.openingDays ?? [],
        attentionSchedule: raw.attentionSchedule ?? null,
        menu: raw.menu ?? [],
      };
    } else {
      return {
        ...commonBiz,
        businessType: BUSINESS_TYPES.hotel,
        hotelType: raw.hotelType,
        roomPacks: raw.roomPacks ?? [],
      };
    }
  }
  
  return { ...base, role: ACCOUNT_TYPES.user };
}