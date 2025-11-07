/* eslint-disable @typescript-eslint/no-explicit-any */
// SearchBarRestaurant.tsx
import React, { useState } from "react";
import {
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import type { SelectChangeEvent } from "@mui/material";
import type {CommonFilters} from "./utils/BaseSearchBar";
import { BaseSearchBar } from "./utils/BaseSearchBar";
//QUITAR CUANDO YA SEA PUBLICO
import { useAuth } from "../../hooks/useAuth";
import { searchBusiness } from "../../services/searchService";
import type { BusinessPubAccountDataDTO } from "../../types/AccountData";
import type { SearchBusinessFilters } from "../../types/searchBusinessFilters";
import type { BusinessType } from "../../types/AccountTypes";
import {MOCK_BUSINESS_SEARCH_RESULTS, aplyFiltersToMock} from "../mocks/businessMocks";
import type { RestaurantType } from "../../types/Restaurant";
import { MOCKEAR_RESULTADOS_DE_PERFILES } from "../../constants/UseMOCK";

export const SearchBarRestaurant = ({
  onSearchResults,
}: {
  onSearchResults: (restaurants: BusinessPubAccountDataDTO[]) => void;
}) => {
  const { accessToken } = useAuth();
  const [filters, setFilters] = useState<SearchBusinessFilters>({});
  

  const [loading, setLoading] = useState(false);

  const handleSearch = async (commonFilters: CommonFilters) => {
    //QUITAR CUANDO SEA PUBLICO
    if (!accessToken) return;
    setLoading(true)
    try {
      // Construcción dinámica del objeto de filtros
      const params: Record<string, any> = {
        businessType: "RESTAURANT" as BusinessType,
      };
      if (commonFilters.username?.trim()) params.username = commonFilters.username.trim();
      if (commonFilters.location?.trim()) params.location = commonFilters.location.trim();
      if (commonFilters.averagePrice) params.averagePrice = commonFilters.averagePrice;
      
      if (filters.restaurantType) params.restaurantType = filters.restaurantType;
      if (filters.attentionSchedule?.openingTime) params.attentionSchedule = {openingTime: filters.attentionSchedule.openingTime};
      if (filters.attentionSchedule?.closingTime) params.attentionSchedule = {closingTime: filters.attentionSchedule.closingTime};

      console.log("🔍 Parámetros de búsqueda (restaurants):", params);
      // QUITAR CUANDO SEA PUBLICO
      const response = await searchBusiness(accessToken,params);
      console.log("¡¡¡ Response de búsqueda de la api(restaurants):", response);
      const restaurants: BusinessPubAccountDataDTO[] = [];

      //INYECTO RESULTADOS CON MOCKITO (QUITAR)
      if (MOCKEAR_RESULTADOS_DE_PERFILES) {
        restaurants.push(...aplyFiltersToMock(MOCK_BUSINESS_SEARCH_RESULTS, params));
      }

      if (response != null) {
        restaurants.push(...response.content);
      }
      
      onSearchResults(restaurants);

    } catch (err) {
      console.error(err);
      onSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseSearchBar
      loading={loading}
      onSearch={handleSearch}
      renderExtraFilters={() => (
        <Stack spacing={2}>
          <FormControl size="small">
            <InputLabel id="restaurant-type-label">Tipo de restaurante</InputLabel>
            <Select
              labelId="restaurant-type-label"
              value={filters.restaurantType??""}
              onChange={(e: SelectChangeEvent) => setFilters({...filters, restaurantType: e.target.value as RestaurantType})}
              label="Tipo de restaurante"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="Cafe">Café</MenuItem>
              <MenuItem value="Vegano">Vegano</MenuItem>
              <MenuItem value="Vegetariano">Vegetariano</MenuItem>
              <MenuItem value="Peruano">Peruano</MenuItem>
              <MenuItem value="Argentino">Argentino</MenuItem>
              <MenuItem value="Italiano">Italiano</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Horario de atención (ej. 9:00-10:00)"
            size="small"
            value={filters.attentionSchedule?.openingTime??""}
            onChange={(e) => setFilters({...filters, attentionSchedule: {...filters.attentionSchedule, openingTime: e.target.value}})}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccessTimeIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      )}
    />
  );
};
