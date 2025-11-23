// src/pages/RestaurantPubProfile.tsx
import { useLocation } from "react-router-dom";
import BusinessPubProfileLayout from "../components/profile/businessPublicProfile/common/BusinessPubProfileLayout";
import { RestaurantItemMenuCard } from "../components/profile/businessPublicProfile/restaurant/MenuItemCardUser";
import type { BusinessPubAccountDataDTO } from "../types/AccountData";
import type { MenuItem } from "../types/Restaurant";

export default function RestaurantPubProfile() {
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
