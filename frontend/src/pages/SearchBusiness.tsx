/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useLocation } from "react-router-dom";
import { SearchBarHotel } from "../components/search/SearchBarHotel";
import { SearchBarRestaurant } from "../components/search/SearchBarRestaurant";
import PlaceGrid from "../components/search/ResultsPlaceGrid";
import { BusinessRecommendationsSection } from "../components/recommendations/BusinessRecommendationsSection";
import type { BusinessPubAccountDataDTO } from "../types/AccountData";

function SearchBoxContainer({
  onResults,
}: {
  onResults: (results: BusinessPubAccountDataDTO[]) => void;
}) {
  const [mode, setMode] = useState<"hotel" | "restaurant">("hotel");
  const theme = useTheme();

  return (
    <Stack spacing={4} alignItems="center">
      {/* Título con pingüinos */}
      <Stack direction="row" alignItems="center" spacing={2} justifyContent="center">

        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            color: theme.palette.text.primary,
            textAlign: "center",
            letterSpacing: "0.05em",
            textShadow: "7px 7px 5px rgba(55, 82, 106, 0.1)",
          }}
        >
          ¿Buscando una nueva experiencia?🐧
        </Typography>
      </Stack>

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

  // Load saved search results from sessionStorage on mount
  useEffect(() => {
    const savedResults = sessionStorage.getItem("searchBusiness_results");
    const savedIsSearching = sessionStorage.getItem("searchBusiness_isSearching");

    if (savedResults && savedIsSearching === "true") {
      try {
        const parsedResults = JSON.parse(savedResults);
        setSearchResults(parsedResults);
        setIsSearching(true);
      } catch (error) {
        console.error("Error parsing saved search results:", error);
        sessionStorage.removeItem("searchBusiness_results");
        sessionStorage.removeItem("searchBusiness_isSearching");
      }
    }
  }, []);

  const handleSearchResults = (results: BusinessPubAccountDataDTO[]) => {
    setSearchResults(results);
    setIsSearching(true);
    // Save to sessionStorage
    sessionStorage.setItem("searchBusiness_results", JSON.stringify(results));
    sessionStorage.setItem("searchBusiness_isSearching", "true");
  };

  const resetSearch = () => {
    setSearchResults([]);
    setIsSearching(false);
    // Clear sessionStorage
    sessionStorage.removeItem("searchBusiness_results");
    sessionStorage.removeItem("searchBusiness_isSearching");
  };

  const items = useMemo(() => {
    if (isSearching) {
      return searchResults;
    }
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

      {/* Recomendaciones en acordeón con efecto glassmorphism */}
      <Accordion
        defaultExpanded
        sx={{
          background: theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(12px)",
          borderRadius: "20px !important",
          border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}`,
          boxShadow: theme.palette.mode === "dark"
            ? "0 8px 32px 0 rgba(0, 0, 0, 0.37)"
            : "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
          overflow: "hidden",
          "&:before": {
            display: "none",
          },
          "&.Mui-expanded": {
            margin: 0,
          },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            "& .MuiAccordionSummary-content": {
              margin: "16px 0",
            },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 700,
            }}
          >
            ✨ Recomendados para vos
          </Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{
            pt: 0,
          }}
        >
          <BusinessRecommendationsSection />
        </AccordionDetails>
      </Accordion>

    </Stack>
  );
}
