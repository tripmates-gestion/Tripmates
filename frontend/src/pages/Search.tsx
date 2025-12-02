/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { SearchBarHotel } from "../components/search/SearchBarHotel";
import { SearchBarRestaurant } from "../components/search/SearchBarRestaurant";
import PlaceGrid from "../components/search/ResultsPlaceGrid";
import { BusinessRecommendationsSection } from "../components/recommendations/BusinessRecommendationsSection";
import type { BusinessPubAccountDataDTO } from "../types/AccountData";

// ---------------------------------------------------------
// Componente: Selector y barra de búsqueda (Hotel / Restaurante)
// ---------------------------------------------------------
function SearchBoxContainer({
  onResults,
}: {
  onResults: (results: BusinessPubAccountDataDTO[]) => void;
}) {
  const [mode, setMode] = useState<"hotel" | "restaurant">("hotel");
  const theme = useTheme();

  return (
    <Stack spacing={4} alignItems="center">
      {/* Título */}
      <Typography
        variant="h3"
        sx={{
          // fontStyle: "oblique",
          fontWeight: 800,
          color: theme.palette.text.primary,
          textAlign: "center",
          letterSpacing: "0.05em",
          mb: 2,
          textShadow: "7px 7px 5px rgba(55, 82, 106, 0.1)",
        }}
        
      >
        ¿Buscando una nueva experiencia?
      </Typography>

      {/* Botones de modo */}
      <Stack direction="row" spacing={2}>
        <Button
          variant={mode === "hotel" ? "contained" : "outlined"}
          onClick={() => setMode("hotel")}
          sx={{
            borderRadius: "50px",
            textTransform: "none",
            px: 4,
            fontSize: "1rem",
            fontWeight: mode === "hotel" ? 600 : 400,
          }}
        >
          Hoteles
        </Button>
        <Button
          variant={mode === "restaurant" ? "contained" : "outlined"}
          onClick={() => setMode("restaurant")}
          sx={{
            borderRadius: "50px",
            textTransform: "none",
            px: 4,
            fontSize: "1rem",
            fontWeight: mode === "restaurant" ? 600 : 400,
          }}
        >
          Restaurantes
        </Button>
      </Stack>

      {/* Barra de búsqueda dinámica */}
        <Box width="100%" maxWidth="900px">
          {mode === "hotel" ? (
            <SearchBarHotel onSearchResults={onResults} />
          ) : (
            <SearchBarRestaurant onSearchResults={onResults} />
          )}
        </Box>
      </Stack>
    );
  }


// ---------------------------------------------------------
// Página principal de búsqueda
// ---------------------------------------------------------
export default function Search() {
  const q = new URLSearchParams(useLocation().search).get("q") || "";
  const [searchResults, setSearchResults] = useState<BusinessPubAccountDataDTO[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchResults = (results: BusinessPubAccountDataDTO[]) => {
    setSearchResults(results);
    setIsSearching(true);
  };

  const resetSearch = () => {
    setSearchResults([]);
    setIsSearching(false);
  };

  const items = useMemo(() => {
    if (isSearching) {
      return searchResults;
    }
  
    // Si no hay búsqueda activa, mostrar los mocks filtrados
    return [];
  }, [q, searchResults, isSearching]);
  

  const theme = useTheme();

  return (
    <Stack spacing={5} sx={{ px: { xs: 2, sm: 4 }, py: 4 }}>
      {/* Barra de búsqueda */}
      <SearchBoxContainer onResults={handleSearchResults} />

      {/* Título dinámico */}

      <Typography
        variant="h5"
        textAlign="left"
        sx={{
          color: theme.palette.text.secondary,
          fontWeight: 700,
          mt: 4,
          mb: 1,
        }}
      >
        {isSearching
          ? `🔎 Resultados (${searchResults.length})`
          : q
          ? `Resultados para “${q}”`
          : ""}
      </Typography>

      {/* Resultados de búsqueda */}
      {isSearching && (
        <>
          {items.length > 0 ? (
            <PlaceGrid businessAccounts={items} />
          ) : (
            <Stack alignItems="center" spacing={2} sx={{ py: 8 }}>
              <Typography variant="h6" color="text.secondary" fontStyle="italic">
                No se encontraron resultados
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Intenta con otros términos o una ubicación distinta.
              </Typography>
              <Button variant="outlined" onClick={resetSearch} sx={{ mt: 2 }}>
                Ver todas las opciones
              </Button>
            </Stack>
          )}

          {/* Separador visual antes de recomendaciones */}
          <Box
            sx={{
              width: "100%",
              height: "2px",
              bgcolor: theme.palette.divider,
              my: 4,
            }}
          />
        </>
      )}

      {/* Título recomendaciones (solo si hubo búsqueda) */}
      {isSearching && (
        <Typography
          variant="h6"
          textAlign="left"
          sx={{
            color: theme.palette.text.secondary,
            fontWeight: 700,
            mb: 2,
          }}
        >
          ✨ Recomendados para vos
        </Typography>
      )}

      {/* Recomendaciones */}
      <BusinessRecommendationsSection />
      
      
      {/* Resultados */}
      {items.length > 0 ? (
        <PlaceGrid businessAccounts={items} />
      ) : null}

    </Stack>
  );
}
