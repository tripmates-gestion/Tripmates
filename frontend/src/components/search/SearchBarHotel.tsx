import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import React from 'react'
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import { ENDPOINTS } from '../../api/endpoints';
import { searchHotels } from '../../services/searchService';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';

interface SearchBarHotelProps {
  onSearchResults: (hotels: any[]) => void; // Callback para enviar resultados al padre
}

export function SearchBarHotel({ onSearchResults }: SearchBarHotelProps) {
    const { token: accessToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState('');

    const handleSearch = async () => {
        if (!accessToken) {
            console.error('No access token available');
            return;
        }

        setLoading(true);
        try {
            const hotelsResponse = await searchHotels(accessToken, { "location": location });
            const hotels = hotelsResponse.content;
            console.log('Hotels found:', hotels);
            
            onSearchResults(hotels);
        } catch (error) {
            console.error('Error searching hotels:', error);
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
            <Stack
                direction="row"
                spacing={1}
                sx={{
                    bgcolor: 'transparent',
                    p: 2,
                    borderRadius: 8,
                    alignItems: 'center',
                }}
            >
                <TextField
                    name="ciudad"
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
                    sx={{ borderRadius: "50px", bgcolor: "#f7f7f7", minWidth: 50 }}
                />

                {/*
                <TextField
                    name="llegada"
                    type="date"
                    variant="outlined"
                    size="small"
                    InputProps={{
                        startAdornment: (
                        <InputAdornment position="start">
                            <CalendarMonthIcon color="action" />
                        </InputAdornment>
                        ),
                    }}
                    sx={{ borderRadius: "50px", bgcolor: "#f7f7f7", minWidth: 160 }}
                />

                <TextField
                    name="salida"
                    type="date"
                    variant="outlined"
                    size="small"
                    InputProps={{
                        startAdornment: (
                        <InputAdornment position="start">
                            <CalendarMonthIcon color="action" />
                        </InputAdornment>
                        ),
                    }}
                    sx={{ borderRadius: "50px", bgcolor: "#f7f7f7", minWidth: 160 }}
                />

                <TextField
                    name="precioMin"
                    placeholder="Precio mín."
                    variant="outlined"
                    size="small"
                    InputProps={{
                        startAdornment: (
                        <InputAdornment position="start">
                            <MonetizationOnIcon color="action" />
                        </InputAdornment>
                        ),
                    }}
                    sx={{ borderRadius: "50px", bgcolor: "#f7f7f7", minWidth: 80, maxWidth: 150 }}
                />

                <TextField
                    name="precioMax"
                    placeholder="Precio máx."
                    variant="outlined"
                    size="small"
                    InputProps={{
                        startAdornment: (
                        <InputAdornment position="start">
                            <MonetizationOnIcon color="action" />
                        </InputAdornment>
                        ),
                    }}
                    sx={{ borderRadius: "50px", bgcolor: "#f7f7f7", minWidth: 80, maxWidth: 150 }}
                /> */}

                <Button
                    variant="contained"
                    startIcon={<SearchIcon />}
                    disabled={loading}
                    sx={{
                        borderRadius: "50px",
                        bgcolor: "primary",
                        color: "white",
                        textTransform: "none",
                        px: 3,
                        fontWeight: "bold",
                        "&:hover": { bgcolor: "secondary" },
                    }}
                    onClick={handleSearch}
                >
                    {loading ? 'Buscando...' : 'Buscar'}
                </Button>
            </Stack>
        </Box>
    );
}