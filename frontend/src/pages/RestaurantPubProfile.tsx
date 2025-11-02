// src/pages/RestaurantPubProfile.tsx
import { useLocation } from "react-router-dom";
import BusinessPubProfileLayout from "../components/profile/businessProfile/BusinessPubProfileLayout";
import { RestaurantItemMenuCard } from "../components/profile/businessProfile/restaurant/MenuItemCardUser";
import type { BusinessPubAccountDataDTO } from "../types/AccountData";
import type { MenuItem } from "../types/Restaurant";

export default function RestaurantPubProfile() {
  const location = useLocation();
  const restaurant = location.state.account as BusinessPubAccountDataDTO;
  console.log("Redirección a restaurant recibió estado: ",location.state)

  const menuTab = <RestaurantItemMenuCard menu={restaurant.menu as MenuItem[]} />;

  return (
    <BusinessPubProfileLayout
      business={restaurant}
      specificTab={menuTab}
      infoTabLabel="Menu"
    />
  );
}
