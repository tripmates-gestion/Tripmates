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

import { MOCKEAR_RESULTADOS } from "../../pages/Search";
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
      const params : SearchBusinessFilters ={
        ...commonFilters,
        businessType: "RESTAURANT" as BusinessType,
        ...(filters.restaurantType && { restaurantType: filters.restaurantType }),
        ...(filters.attentionSchedule?.openingTime && { attentionSchedule: {openingTime: filters.attentionSchedule.openingTime} }),
        ...(filters.attentionSchedule?.closingTime && { attentionSchedule: {closingTime: filters.attentionSchedule.closingTime} }),
      };

      console.log("🔍 Parámetros de búsqueda (restaurants):", params);
      // QUITAR CUANDO SEA PUBLICO
      const response = await searchBusiness(accessToken,params);
      console.log("¡¡¡ Response de búsqueda de la api(restaurants):", response);
      const restaurants: BusinessPubAccountDataDTO[] = [];

      //INYECTO RESULTADOS CON MOCKITO (QUITAR)
      if (MOCKEAR_RESULTADOS) {
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
              <MenuItem value="cafe">Café</MenuItem>
              <MenuItem value="vegano">Vegano</MenuItem>
              <MenuItem value="vegetariano">Vegetariano</MenuItem>
              <MenuItem value="peruano">Peruano</MenuItem>
              <MenuItem value="argento">Argentino</MenuItem>
              <MenuItem value="italiano">Italiano</MenuItem>
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
