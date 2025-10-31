import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
//import PlaceCard, { type Place } from '../components/publish/PlaceCard';
import React from 'react'
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '../../hooks/useAuth';
import { searchRestaurants } from '../../services/searchService';
import { useState } from 'react';
import { normalizeToBusinessPlace } from './utils/normalizePlace';

interface SearchBarRestaurantProps {
  onSearchResults: (restaurants: any[]) => void; // Callback para enviar resultados al padre
}

function mapRestaurant(restaurant: any) {
  return normalizeToBusinessPlace(restaurant);
}


export function SearchBarRestaurant({ onSearchResults }: SearchBarRestaurantProps) {
  const { accesToken: accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState('');
  const [name, setName] = useState('');

  const handleSearch = async () => {
    if (!accessToken) {
      console.error('No access token available');
      onSearchResults([]);
      return;
    }

    setLoading(true);
    try {
        const restaurantsResponse = await searchRestaurants(accessToken, { "location": location }); 
        const restaurants = restaurantsResponse?.content ?? [];
        console.log('Restaurants found:', restaurants);

        let filteredRestaurants = restaurants;
        if (name && name.trim() !== '') {
          filteredRestaurants = restaurants.filter((restaurant: any) =>
            restaurant.name && restaurant.name.toLowerCase().includes(name.toLowerCase())
          );
        }

        const mappedRestaurants = filteredRestaurants.map(mapRestaurant);
        console.log('Restaurants found:', mappedRestaurants);
        

        onSearchResults(mappedRestaurants);

    } catch (error) {
      console.error('Error searching restaurants:', error);
      onSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "white",
        borderRadius: "50px",
        p: 2,
        boxShadow: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "100%",
        minHeight: "80px",
        maxHeight: "80px",
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          name="restaurante"
          placeholder="Ciudad"
          variant="outlined"
          size="small"
          onChange={(e) => setLocation(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationOnIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ borderRadius: "50px", bgcolor: "#f7f7f7", minWidth: 250 }}
        />

        <TextField
            name="nombre"
            placeholder="Nombre"
            variant="outlined"
            size="small"
            onChange={(e) => setName(e.target.value)}
            sx={{ borderRadius: "50px", bgcolor: "#f7f7f7", minWidth: 50 }}
        />


        <Button
          variant="contained"
          startIcon={<SearchIcon />}
          sx={{
            borderRadius: "50px",
            bgcolor: "primary.main",
            color: "white",
            textTransform: "none",
            px: 3,
            fontWeight: "bold",
            "&:hover": { bgcolor: "primary.dark" },
          }}
            onClick={handleSearch}
        >
          Buscar
        </Button>
      </Stack>
    </Box>
  );
}