import type { AveragePrice, AttentionSchedule, DayOfWeek } from './business';
import type { MenuItem } from './Restaurant';
import type { HotelType, RoomPack } from './Hotel';

export type AccountRole = 'USER' | 'BUSINESS';
export type AccountBusinessType = 'RESTAURANT' | 'HOTEL';

export type AccountResume = {
  id: string;
  avatarURL?: string | null;
  name: string;
  email: string;
  role: AccountRole;
  description?: string | null;
  businessType?: AccountBusinessType | null;
  location?: string | null;
  phoneNumber?: string | null;
  publicEmail?: string | null;
  profileImageUrls?: string[] | null;
  averagePrice?: AveragePrice | null;
  restaurantType?: string | null;
  attentionSchedule?: AttentionSchedule | null;
  openingDays?: DayOfWeek[] | null;
  menu?: MenuItem[] | null;
  hotelType?: HotelType | null;
  roomPacks?: RoomPack[] | null;
};
