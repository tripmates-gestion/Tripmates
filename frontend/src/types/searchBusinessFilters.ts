import type { HotelType } from "../types/Hotel"
import type { RestaurantType } from "../types/Restaurant"
import type { BusinessType } from "../types/AccountTypes"
import type {AveragePrice} from "../types/business"

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