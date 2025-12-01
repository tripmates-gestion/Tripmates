import type {AccountType, BusinessType} from "./AccountTypes";
import type {DayOfWeek} from "./Business";
import type {AttentionSchedule, AveragePrice} from "./Business";
import type {RestaurantType, MenuItem} from "./Restaurant";
import type { HotelType, RoomPack } from "./Hotel";

/*CONTRATO EN DESARROLLO DE LO QUE DEBERÍA DEVOLVER EL BACK EN UNA BÚSQUEDA DE ALGÚN BUSINESS*/
// tiene algunos campos opcionales porque dependen de si es un restaurant o si es un hotel
export type BusinessPubAccountDataDTO = {
    id: string;
    avatarURL: string;
    name: string;
    email: string;
    role: AccountType;
    description: string;
    location: {
      address: string;
      latitude: number;
      longitude: number;
    };
    phoneNumber: string;
    publicEmail: string;
    profileImageUrls: string[];
    businessType: BusinessType;
    averagePrice: AveragePrice;
     
    // campos si es restaurant
    restaurantType: RestaurantType|null;
    attentionSchedule: AttentionSchedule|null;
    openingDays: DayOfWeek[]|null;
    menu: MenuItem[]|null;
    
    // campos si es hotel
    hotelType: HotelType|null;
    roomPacks: RoomPack[]|null;
}
