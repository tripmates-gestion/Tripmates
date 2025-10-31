// src/pages/Search.tsx
import { useMemo } from 'react';
//import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
//import PlaceCard, { type Place } from '../components/publish/PlaceCard';
import { useLocation, useNavigate } from 'react-router-dom';
// import React from 'react'
// import LocationOnIcon from '@mui/icons-material/LocationOn';
// import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
// import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
// import InputAdornment from '@mui/material/InputAdornment';
// import TextField from '@mui/material/TextField';
// import SearchIcon from '@mui/icons-material/Search';
import { useState } from 'react';
import { SearchBarHotel } from '../components/search/SearchBarHotel';
import { SearchBarRestaurant } from '../components/search/SearchBarRestaurant';
import PlaceGrid  from '../components/search/PlaceGrid';
import { normalizeToBusinessPlace } from '../components/search/utils/normalizePlace';


export function SearchBoxContainer({ onResults }: { onResults: (results: any[]) => void }) {
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


// Esto deberia ir en la BDD xD, las fotos son elegidas de forma random
const MOCK = [
  {
    id: '1',
    name: 'Hotel Bariloche Lake',
    city: 'Bariloche',
    country: 'Argentina',
    rating: 4.5,
    priceLabel: '$$',
    photoUrl: 'https://club-catedral-spa-resort.hotelesenpatagonia.com/data/Images/OriginalPhoto/16110/1611086/1611086305/image-san-carlos-de-bariloche-hotel-catedral-ski-wellness-23.JPEG',
  },
  {
    id: '2',
    name: 'Cabañas del Bosque',
    city: 'Villa La Angostura',
    country: 'Argentina',
    rating: 4.2,
    priceLabel: '$$',
    photoUrl: 'https://amigos-del-bosque.hotelesenpatagonia.com/data/Images/OriginalPhoto/16308/1630875/1630875450/image-villa-la-angostura-el-bosque-by-dot-tradition-1.JPEG',
  },
  {
    id: '3',
    name: 'Restó Patagonia',
    city: 'San Martín de los Andes',
    country: 'Argentina',
    rating: 4.7,
    priceLabel: '$$$',
    photoUrl: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/29/4d/32/46/frente-de-restaurante.jpg?w=1100&h=1100&s=1',
  },
  {
    id: '4',
    name: 'London',
    city: 'London',
    country: 'United Kingdom',
    rating: 4.7,
    priceLabel: '$$$',
    photoUrl: 'https://www.londoninfoguide.com/images/oxford-street-in-london-england-uk.webp'
  },
  {
    id: '5',
    name: 'Helsinki',
    city: 'Helsinki',
    country: 'Finland',
    rating: 4.7,
    priceLabel: '$$$',
    photoUrl: 'https://content.r9cdn.net/rimg/dimg/30/00/adff18cf-city-7232-16480d2ee82.jpg?crop=true&width=1020&height=498'
  },
  {
    id: '6',
    name: 'Santorini',
    city: 'Santorini',
    country: 'Greece',
    rating: 4.7,
    priceLabel: '$$$',
    photoUrl: 'https://www.greekexclusiveproperties.com/wp-content/uploads/2019/10/Santorini-Declared-No1-Island-in-the-World-.jpg'
  },
];


export default function Search() {
  const nav = useNavigate();
  const q = new URLSearchParams(useLocation().search).get('q') || '';
  
  // Estado para almacenar los resultados de búsqueda (con TODA LA información retornada)
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const [isSearching, setIsSearching] = useState(false);

  // Función para manejar los resultados de búsqueda
  const handleSearchResults = (results: any[]) => {
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
    return MOCK.filter(p =>
      !q ? true : (
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.city.toLowerCase().includes(q.toLowerCase())
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
        // tema... ¿Qué le envíamos a la placeGrid para que renderice en miniatura los resultados de business y cuando se le haga click se redirija a la página de detalles de la cuenta?
        <PlaceGrid places={items.map(normalizeToBusinessPlace)} />
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