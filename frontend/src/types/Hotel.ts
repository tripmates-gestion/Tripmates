export type HotelType = "hotel" | "hostel" | "departamento" | "cabaña" | "camping" | "LUJO"


export type RoomPackDTO = {
    checkInDate: string;        // formato "yyyy-MM-dd"
    checkOutDate: string;       // formato "yyyy-MM-dd"
    numberOfGuests: number;
    services: string[];
    price: number;
    description: string;
    photosURLs: string[];
}

export type RoomPack = Omit<RoomPackDTO, 'checkInDate' | 'checkOutDate'> & {
    checkInDate: Date;
    checkOutDate: Date;
  };
