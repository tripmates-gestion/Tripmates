// src/pages/HotelPubProfile.tsx
import { useLocation } from "react-router-dom";
import BusinessPubProfileLayout from "../components/profile/businessPublicProfile/common/BusinessPubProfileLayout";
import { HotelRoomsCard } from "../components/profile/businessPublicProfile/hotel/HotelUserRoomsCard";
import type { BusinessPubAccountDataDTO } from "../types/AccountData";
import type { RoomPack } from "../types/Hotel";

export default function HotelPubProfile() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  let account = location.state?.account;

  if (!account) {
    const raw = params.get("account");
    if (raw) {
      try {
        account = JSON.parse(decodeURIComponent(raw));
      } catch (e) {
        console.error("Error parsing account:", e);
      }
    }
  }

  if (!account) {
    return <div>No se pudo cargar el perfil.</div>;
  }

  console.log("HotelPubProfile account:", account);
  const hotel = account as BusinessPubAccountDataDTO;
  console.log("Redirección a hotel recibió estado: ",hotel)

  const specificTab = <HotelRoomsCard roomPacks={hotel.roomPacks as RoomPack[]} />;

  return (
    <BusinessPubProfileLayout
      business={hotel}
      specificTab={specificTab}
      infoTabLabel="Habitaciones"
    />
  );
}
