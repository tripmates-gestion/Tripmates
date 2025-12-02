// src/pages/RestaurantPubProfile.tsx
import * as React from "react";
import { useEffect } from "react";
import {useLocation, useParams } from "react-router-dom";
import BusinessPubProfileLayout from "../components/profile/businessPublicProfile/common/BusinessPubProfileLayout";
import { RestaurantItemMenuCard } from "../components/profile/businessPublicProfile/restaurant/MenuItemCardUser";
import type { BusinessPubAccountDataDTO } from "../types/AccountData";
import type { MenuItem } from "../types/Restaurant";
import { useAuth } from "../hooks/useAuth";
import { getUserById } from "../services/userService";

export default function RestaurantPubProfile() {
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
      .catch((e) => console.error("No se pudo cargar el perfil del restaurante", e));
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

  const restaurant = account as BusinessPubAccountDataDTO;
  console.log("Redirección a restaurant recibió estado: ",restaurant)


  const menuTab = <RestaurantItemMenuCard menu={restaurant.menu as MenuItem[]} />;

  return (
    <BusinessPubProfileLayout
      business={restaurant}
      specificTab={menuTab}
      infoTabLabel="Menu"
    />
  );
}
