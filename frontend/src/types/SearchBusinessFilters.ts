import type { HotelType } from "./Hotel"
import type { RestaurantType } from "./Restaurant"
import type { BusinessType } from "./AccountTypes"
import type {AveragePrice} from "./Business"

export type SearchBusinessFilters = {
    //COMUNES
    username?: string
    location?: string
    averagePrice?: AveragePrice
    businessType?: BusinessType
  
    //RESTAURANT
    restaurantType?: RestaurantType
    attentionSchedule?: {
      openingTime?: string // formato HH:mm
      closingTime?: string // formato HH:mm
    }
  
    //HOTEL
    hotelType?: HotelType
    roomPack?: {
      checkInDate?: string // formato yyyy-MM-dd
      checkOutDate?: string // formato yyyy-MM-dd
      numberOfGuests?: number
      price?: number
      services?: string[]
    }
  }