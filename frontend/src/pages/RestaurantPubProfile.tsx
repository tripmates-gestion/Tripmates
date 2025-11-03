// src/pages/RestaurantPubProfile.tsx
import { useLocation } from "react-router-dom";
import BusinessPubProfileLayout from "../components/profile/businessPublicProfile/BusinessPubProfileLayout";
import { RestaurantMenuTab } from "../components/profile/businessPublicProfile/restaurant/RestaurantMenuTab";
import type { BusinessPubAccountDataDTO } from "../types/AccountData";
import type { MenuItem } from "../types/Restaurant";

export default function RestaurantPubProfile() {
  const location = useLocation();
  const restaurant = location.state.account as BusinessPubAccountDataDTO;
  console.log("Redirección a restaurant recibió estado: ",location.state)

  const menuTab = <RestaurantMenuTab menu={restaurant.menu as MenuItem[]} />;

  return (
    <BusinessPubProfileLayout
      business={restaurant}
      specificTab={menuTab}
      infoTabLabel="Menu"
    />
  );
}
