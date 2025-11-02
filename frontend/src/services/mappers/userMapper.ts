import type { CommonUsersInformation } from '../../types/CommonUserInfo';
import type { CurrentUser } from '../../context/TypesUser';
import { ACCOUNT_TYPES, BUSINESS_TYPES } from '../../constants/Rol';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapUser2(data: any): CommonUsersInformation {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid user data');
  }
  console.log("[UserMapper] Mapping user recived from GET user/me", data);
  return {
    id: data.id,
    email: data.email,
    username: data.name,
    role: data.role,
    description: data.description || '',
    avatarURL: data.avatarURL,
  };
}


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