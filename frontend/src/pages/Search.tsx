/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Search.tsx
import { useMemo } from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import { SearchBarHotel } from '../components/search/SearchBarHotel';
import { SearchBarRestaurant } from '../components/search/SearchBarRestaurant';
import PlaceGrid  from '../components/search/PlaceGrid';
import { MOCK_BUSINESS_SEARCH_RESULTS } from '../components/mocks/businessMocks';
import type{ BusinessPubAccountDataDTO } from '../types/AccountData';


export function SearchBoxContainer({ onResults }: { onResults: (results: BusinessPubAccountDataDTO[]) => void }) {
  const [mode, setMode] = useState("hotel");

  return (
    <Stack spacing={2}>
      {/* Botones de modo */}
      <Stack direction="row" spacing={2}>
        <Button
          variant={mode === "hotel" ? "contained" : "outlined"}
          onClick={() => setMode("hotel")}
          sx={{ borderRadius: "50px", textTransform: "none", px: 3 }}
        >
          Hoteles
        </Button>
        <Button
          variant={mode === "restaurant" ? "contained" : "outlined"}
          onClick={() => setMode("restaurant")}
          sx={{ borderRadius: "50px", textTransform: "none", px: 3 }}
        >
          Restaurantes
        </Button>
      </Stack>

      {/* Barra de búsqueda dinámica */}
      {mode === "hotel" ? (
        <SearchBarHotel onSearchResults={onResults} />
      ) : (
        <SearchBarRestaurant onSearchResults={onResults} />
      )}
    </Stack>
  );
}



export default function Search() {
  // const nav = useNavigate();
  const q = new URLSearchParams(useLocation().search).get('q') || '';
  
  // Estado para almacenar los resultados de búsqueda (con TODA LA información retornada)
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const [isSearching, setIsSearching] = useState(false);

  // Función para manejar los resultados de búsqueda
  const handleSearchResults = (results: BusinessPubAccountDataDTO[]) => {
    setSearchResults(results);
    setIsSearching(true); // Siempre true cuando se hace una búsqueda
    console.log('Resultados recibidos en Search:', results);
  };

  // Función para resetear la búsqueda
  const resetSearch = () => {
    setSearchResults([]);
    setIsSearching(false);
  };

  // Usar resultados de búsqueda si existe una búsqueda activa, sino usar MOCK filtrado
  const items = useMemo(() => {
    if (isSearching) {
      return searchResults; // Mostrar resultados de la API (puede ser array vacío)
    }
    
    // Fallback al comportamiento original con MOCK
    return MOCK_BUSINESS_SEARCH_RESULTS.filter(p =>
      !q ? true : (
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.location.toLowerCase().includes(q.toLowerCase())
      )
    );
  }, [q, searchResults, isSearching]);

  return (
    <Stack spacing={3}>
      <SearchBoxContainer onResults={handleSearchResults} />

      {/* Título dinámico */}
      <Typography variant="h5">
        {isSearching 
          ? `Resultados de búsqueda (${searchResults.length} encontrados)`
          : `Resultados ${q && `para "${q}"`}`
        }
      </Typography>

      {/* Grilla responsiva o mensaje de sin resultados */}
      {items.length > 0 ? (
        <PlaceGrid businessAccounts={items} />
      ) : (
        <Stack 
          spacing={2} 
          alignItems="center" 
          sx={{ py: 8, textAlign: 'center' }}
        >
          <Typography variant="h6" color="text.secondary">
            😔 No se encontraron resultados
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isSearching 
              ? 'Intenta con otros términos de búsqueda o verifica la ubicación.'
              : 'Realiza una búsqueda para ver resultados.'
            }
          </Typography>
          {isSearching && (
            <Button 
              variant="outlined" 
              onClick={resetSearch}
              sx={{ mt: 2 }}
            >
              Ver todas las opciones
            </Button>
          )}
        </Stack>
      )}
      
    </Stack>
  );
}