// SearchBarHotel.tsx
import { useState } from "react";
import {
  Stack,
  TextField,
  InputAdornment,
  Typography,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import GroupIcon from "@mui/icons-material/Group";
import AddIcon from "@mui/icons-material/Add";
import type {CommonFilters} from "./utils/BaseSearchBar";
import { BaseSearchBar } from "./utils/BaseSearchBar";
import { searchBusiness } from "../../services/searchService";
import { useAuth } from "../../hooks/useAuth";
import type { BusinessPubAccountDataDTO } from "../../types/AccountData";
import type { BusinessType } from "../../types/AccountTypes";
import type { HotelType } from "../../types/Hotel";
//TODO cambiar su ubicación
import type { SearchBusinessFilters } from "../../types/searchBusinessFilters";
import {MOCK_BUSINESS_SEARCH_RESULTS, aplyFiltersToMock} from "../mocks/businessMocks";
import { MOCKEAR_RESULTADOS_DE_PERFILES } from "../../constants/UseMOCK";

export const SearchBarHotel = ({
  onSearchResults,
}: {
  onSearchResults: (hotels: BusinessPubAccountDataDTO[]) => void;
}) => {

  const { accessToken } = useAuth();
  const [filters, setFilters] = useState<SearchBusinessFilters>({});
  
  //estado para guardar los servicios que se agregan
  const [serviceInput, setServiceInput] = useState("");

  const [loading, setLoading] = useState(false);

  //callback para guardar los servicios que quiere el usuario en alguna habitación
  const handleAddService = () => {
    const newService = serviceInput.trim();
    if (newService && !filters.roomPack?.services?.includes(newService)) {
      setFilters(prevFilters => ({
        ...prevFilters,
        roomPack: {
          ...prevFilters.roomPack,
          services: [...(prevFilters.roomPack?.services || []), newService]
        }
      }));
      setServiceInput("");
    }
  };

  const handleDeleteService = (service: string) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      roomPack: {
        ...prevFilters.roomPack,
        services: prevFilters.roomPack?.services?.filter(s => s !== service) || []
      }
    }));
  };

  const handleSearch = async (commonFilters: CommonFilters) => {
    //QUITAR CUANDO SEA PUBLICO
    if (!accessToken) return;
    setLoading(true);
    try {
      const params: SearchBusinessFilters = {
        ...commonFilters,
        businessType: "HOTEL" as BusinessType,
        ...(filters.hotelType && { hotelType: filters.hotelType }),
        ...(filters.roomPack?.checkInDate && { checkin: filters.roomPack?.checkInDate }),
        ...(filters.roomPack?.checkOutDate && { checkout: filters.roomPack?.checkOutDate }),
        ...(filters.roomPack?.numberOfGuests && { numberOfGuests: filters.roomPack?.numberOfGuests }),
        ...(filters.roomPack?.services?.length && { services: filters.roomPack?.services }),
      };
      console.log("🔍 Parámetros de búsqueda (hoteles):", params);

      // QUITAR (PARAMETRO) CUANDO SEA PUBLICO
      const response = await searchBusiness(accessToken, params);      
      console.log("¡¡¡ Response de búsqueda de la api(hoteles):", response);
      const hotels: BusinessPubAccountDataDTO[] = [];
      
      //INYECTO RESULTADOS CON MOCKITO (QUITAR)
      if (MOCKEAR_RESULTADOS_DE_PERFILES) {
        hotels.push(...aplyFiltersToMock(MOCK_BUSINESS_SEARCH_RESULTS, params));
      }
      if (response != null) {
        hotels.push(...response.content);
      }
      
      onSearchResults(hotels);
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
          <TextField
            label="Check-in"
            type="date"
            size="small"
            value={filters.roomPack?.checkInDate ?? "mm/dd/yyyy"}
            onChange={(e) => setFilters({...filters, roomPack: {...filters.roomPack, checkInDate: e.target.value}})}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarMonthIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Check-out"
            type="date"
            size="small"
            value={filters.roomPack?.checkOutDate ?? "mm/dd/yyyy"}
            onChange={(e) => setFilters({...filters, roomPack: {...filters.roomPack, checkOutDate: e.target.value}})}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarMonthIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Huéspedes"
            type="number"
            size="small"
            value={filters.roomPack?.numberOfGuests}
            onChange={(e) => setFilters({...filters, roomPack: {...filters.roomPack, numberOfGuests: Number(e.target.value)}})}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <GroupIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small">
            <InputLabel id="hotel-type-label">Tipo de hotel</InputLabel>
            <Select
              labelId="hotel-type-label"
              value={filters.hotelType??""}
              onChange={(e: SelectChangeEvent) => setFilters({...filters, hotelType: e.target.value as HotelType})}
              label="Tipo de hotel"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="hotel">Hotel</MenuItem>
              <MenuItem value="hostel">Hostel</MenuItem>
              <MenuItem value="departamento">Departamento</MenuItem>
              <MenuItem value="cabaña">Cabaña</MenuItem>
              <MenuItem value="camping">Camping</MenuItem>
            </Select>
          </FormControl>


          {/* Servicios como chips */}
          <Stack spacing={1}>
            <Typography variant="subtitle2" color="text.secondary">
              Servicios
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {filters.roomPack?.services?.map((service) => (
                <Chip
                  key={service}
                  label={service}
                  onDelete={() => handleDeleteService(service)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Stack>
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                label="Agregar servicio"
                value={serviceInput}
                onChange={(e) => setServiceInput(e.target.value)}
              />
              <Button onClick={handleAddService} variant="contained" startIcon={<AddIcon />}>
                Agregar
              </Button>
            </Stack>
          </Stack>
        </Stack>
      )}
    />
  );
};
