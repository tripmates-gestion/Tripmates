// src/pages/HotelPubProfile.tsx
import { useLocation } from "react-router-dom";
import BusinessPubProfileLayout from "../components/profile/businessPublicProfile/BusinessPubProfileLayout";
import { HotelRoomsCard } from "../components/profile/businessPublicProfile/hotel/HotelUserRoomsCard";
import type { BusinessPubAccountDataDTO } from "../types/AccountData";
import type { RoomPack } from "../types/Hotel";

export default function HotelPubProfile() {
  const location = useLocation();
  const hotel = location.state.account as BusinessPubAccountDataDTO;
  console.log("Redirección a hotel recibió estado: ",location.state)

  const specificTab = <HotelRoomsCard roomPacks={hotel.roomPacks as RoomPack[]} />;

  return (
    <BusinessPubProfileLayout
      business={hotel}
      specificTab={specificTab}
      infoTabLabel="Habitaciones"
    />
  );
}
