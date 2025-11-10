import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Stack,
  Card,
  CardContent,
  Avatar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

// Lista de imágenes de fondo (puedes reemplazarlas por URLs reales)
const backgroundImages = [
  "/images/group-travel-1.jpg",
  "/images/group-travel-2.jpg",
  "/images/group-travel-3.jpg",
  "/images/group-travel-4.jpg",
];

const TravelersSearchPage: React.FC = () => {
  const [bgIndex, setBgIndex] = useState(0); // índice actual del fondo
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]); // resultados de búsqueda (usuarios)

  // Cambia automáticamente la imagen de fondo cada 6 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Función que simula la búsqueda de usuarios
  const handleSearch = async () => {
    try {
      // 👉 Aquí iría el request al backend.
      // Ejemplo:
      // const response = await axios.get(`/api/users/search?query=${searchTerm}`);
      // setResults(response.data);

      // Por ahora, se simula con datos de ejemplo:
      const dummyResults = [
        {
          id: 1,
          name: "Lucía Fernández",
          username: "@lucia_travels",
          avatar: "/avatars/lucia.jpg",
          bio: "Amante de la montaña y los viajes culturales 🌍",
        },
        {
          id: 2,
          name: "Carlos Rivas",
          username: "@carlosr",
          avatar: "/avatars/carlos.jpg",
          bio: "Explorando Sudamérica en moto 🏍️",
        },
      ];
      setResults(dummyResults);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Fondo con cambio automático de imágenes */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url(${backgroundImages[bgIndex]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transition: "background-image 1s ease-in-out",
          filter: "brightness(0.6)",
        }}
      />

      {/* Capa semitransparente con contenido principal */}
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "white",
          textAlign: "center",
          px: 2,
          backdropFilter: "blur(2px)",
        }}
      >
        {/* Título principal */}
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Conectá con otros viajeros
        </Typography>
        <Typography variant="h6" sx={{ mb: 4, maxWidth: 600 }}>
          Buscá personas que comparten tu pasión por viajar. Descubrí sus experiencias, reviews y aventuras por el mundo.
        </Typography>

        {/* Barra de búsqueda */}
        <Stack
          direction="row"
          spacing={2}
          sx={{
            width: "100%",
            maxWidth: 600,
            backgroundColor: "rgba(255,255,255,0.9)",
            borderRadius: 2,
            p: 1,
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar por nombre o lugares (ej. Cusco, Perú)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              backgroundColor: "white",
              borderRadius: 1,
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            sx={{ borderRadius: 2 }}
          >
            Buscar
          </Button>
        </Stack>
      </Box>

      {/* Sección de resultados */}
      {results.length > 0 && (
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            maxHeight: "45vh",
            overflowY: "auto",
            backgroundColor: "rgba(255,255,255,0.95)",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            p: 3,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Resultados de búsqueda:
          </Typography>
          <Stack spacing={2}>
            {results.map((user) => (
              <Card key={user.id} sx={{ display: "flex", alignItems: "center", p: 2 }}>
                <Avatar
                  src={user.avatar}
                  alt={user.name}
                  sx={{ width: 56, height: 56, mr: 2 }}
                />
                <CardContent sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {user.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.username}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {user.bio}
                  </Typography>
                </CardContent>
                <Button variant="outlined">Seguir</Button>
              </Card>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default TravelersSearchPage;
