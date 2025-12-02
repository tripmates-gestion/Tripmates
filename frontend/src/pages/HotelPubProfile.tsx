// src/pages/HotelPubProfile.tsx
import * as React from "react";
import { useEffect, useLocation, useParams } from "react-router-dom";
import BusinessPubProfileLayout from "../components/profile/businessPublicProfile/common/BusinessPubProfileLayout";
import { HotelRoomsCard } from "../components/profile/businessPublicProfile/hotel/HotelUserRoomsCard";
import type { BusinessPubAccountDataDTO } from "../types/AccountData";
import type { RoomPack } from "../types/Hotel";
import { useAuth } from "../hooks/useAuth";
import { getUserById } from "../services/userService";

export default function HotelPubProfile() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const { id } = useParams();
  const { accessToken } = useAuth();

  const [account, setAccount] = React.useState<BusinessPubAccountDataDTO | null>(
    location.state?.account || null,
  );

  useEffect(() => {
    if (account || !id || !accessToken) return;

    getUserById(id, accessToken)
      .then((data) => setAccount(data as BusinessPubAccountDataDTO))
      .catch((e) => console.error("No se pudo cargar el perfil del hotel", e));
  }, [account, id, accessToken]);

  useEffect(() => {
    if (account) return;
    const raw = params.get("account");
    if (raw) {
      try {
        const parsed = JSON.parse(decodeURIComponent(raw));
        setAccount(parsed);
      } catch (e) {
        console.error("Error parsing account:", e);
      }
    }
  }, [account, params]);

  if (!account) {
    return <div>No se pudo cargar el perfil.</div>;
  }

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
