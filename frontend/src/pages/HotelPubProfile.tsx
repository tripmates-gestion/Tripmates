// src/pages/HotelPubProfile.tsx
import { useLocation } from "react-router-dom";
import BusinessPubProfileLayout from "../components/profile/businessProfile/BusinessPubProfileLayout";
import { HotelRoomsTab } from "../components/profile/businessProfile/hotel/HotelRoomsTab";
import type { BusinessPubAccountDataDTO } from "../types/AccountData";
import type { RoomPackDTO } from "../types/Hotel";

export default function HotelPubProfile() {
  const location = useLocation();
  const hotel = location.state.account as BusinessPubAccountDataDTO;
  console.log("Redirección a hotel recibió estado: ",location.state)

  const specificTab = <HotelRoomsTab roomPacks={hotel.roomPacks as RoomPackDTO[]} />;

  return (
    <BusinessPubProfileLayout
      business={hotel}
      specificTab={specificTab}
      infoTabLabel="Habitaciones"
    />
  );
}
