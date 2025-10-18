// src/pages/Search.tsx
import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import SearchBar from '../components/SearchBar';
import PlaceCard, { type Place } from '../components/PlaceCard';
import { useLocation, useNavigate } from 'react-router-dom';

// Esto deberia ir en la BDD xD, las fotos son elegidas de forma random
const MOCK: Place[] = [
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
  // Hook para navegar a otra URL sin recargar la página
  const nav = useNavigate();

  // Obtiene el texto de búsqueda (q) desde la URL actual
  const q = new URLSearchParams(useLocation().search).get('q') || '';

  // Filtra la lista MOCK según el texto buscado (ignora mayúsculas/minúsculas) esto es O(n)
  const items = useMemo(
    () => MOCK.filter(p =>
      !q ? true : (
        p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.city.toLowerCase().includes(q.toLowerCase())
      )
    ),
    [q] // se recalcula solo si cambia "q"
  );

  return (
    // Contenedor vertical con separación entre elementos
    <Stack spacing={3}>
      {/* Título dinámico que muestra la búsqueda actual */}
      <Typography variant="h5">Resultados {q && `para “${q}”`}</Typography>

      {/* Barra de búsqueda: al enviar, cambia la URL con el nuevo texto */}
      <SearchBar onSubmit={(next) => nav(`/search?q=${encodeURIComponent(next)}`)} />

      {/* Grilla responsiva con las tarjetas de los lugares */}
      <Box
        display="grid"
        gridTemplateColumns={{
          xs: '1fr',          // 1 por fila en móviles
          sm: 'repeat(2, 1fr)', // 2 por fila en tablets
          md: 'repeat(3, 1fr)', // 3 por fila en escritorio
        }}
        gap={4} // espacio entre PlaceCards
      >
        {items.map((p) => (
          <PlaceCard key={p.id} place={p} />
        ))}
      </Box>
      
    </Stack>
  );
}
