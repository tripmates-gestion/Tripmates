import type { AveragePrice, AttentionSchedule, DayOfWeek } from './Business';
import type { MenuItem } from './Restaurant';
import type { HotelType, RoomPack } from './Hotel';
import type { AccountType, BusinessType } from './AccountTypes';


export type CommonUser = {
  id: string;
  avatarURL?: string | null;
  name: string;
  email: string;
  role: AccountType;
  description?: string | null;
  // businessType?: AccountBusinessType | null;
  // location?: string | null;
  // phoneNumber?: string | null;
  // publicEmail?: string | null;
  // profileImageUrls?: string[] | null;
  // averagePrice?: AveragePrice | null;
  // restaurantType?: string | null;
  // attentionSchedule?: AttentionSchedule | null;
  // openingDays?: DayOfWeek[] | null;
  // menu?: MenuItem[] | null;
  // hotelType?: HotelType | null;
  // roomPacks?: RoomPack[] | null;
};
