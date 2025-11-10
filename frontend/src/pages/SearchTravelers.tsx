/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Box, useTheme } from "@mui/material";
import { SEARCH_TRAVELERS_BACKGROUND } from "../constants/DefaultImages";
import BackgroundRotator from "../components/searchTravelers/BackgroundRotator";
import SearchHeader from "../components/searchTravelers/SearchHeader";
import SearchControls from "../components/searchTravelers/SearchControls";
import SearchResults from "../components/searchTravelers/SearchResults";
import { searchTravelers } from "../services/searchService";
import { useAuth } from "../hooks/useAuth";

const TravelersSearchPage: React.FC = () => {
  const authContext = useAuth();

  const theme = useTheme();
  const [bgIndex, setBgIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<"name" | "location">("name");
  const [results, setResults] = useState<any[]>([]);

  // Rotación de fondo
  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % SEARCH_TRAVELERS_BACKGROUND.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const bgColor =
    theme.palette.mode === "light"
      ? "rgba(255, 255, 255, 0.75)"
      : "rgba(0,0,0,0.6)";

  const handleSearch = async () => {
    if (!authContext.accessToken) {
    // Handle the case where there's no access token
    console.error('No access token available');
    return;
  }
    const results = await searchTravelers(authContext.accessToken, searchTerm, searchType);


    // const dummyResults = [
    //   {
    //     id: 1,
    //     name: "Lucía Fernández",
    //     username: "@lucia_travels",
    //     avatar: "/avatars/lucia.jpg",
    //     bio: "Amante de la montaña y los viajes culturales 🌍",
    //   },
    //   {
    //     id: 2,
    //     name: "Carlos Rivas",
    //     username: "@carlosr",
    //     avatar: "/avatars/carlos.jpg",
    //     bio: "Explorando Sudamérica en moto 🏍️",
    //   },
    // ];

    setResults(results);
  };

  const handleUserClick = (user: any) => {
    // 🟢 AQUÍ se implementaría la redirección al perfil del usuario.
    // Ejemplo con React Router:
    // navigate(`/profile/${user.id}`);
    console.log("Usuario seleccionado:", user);
  };

  return (
    <Box sx={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      <BackgroundRotator index={bgIndex} />
      <Box
        sx={{
          position: "relative",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          px: 2,
          textAlign: "center",
        }}
      >
        <SearchHeader />
        <SearchControls
          bgColor={bgColor}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchType={searchType}
          setSearchType={setSearchType}
          onSearch={handleSearch}
        />
        <SearchResults results={results} onUserClick={handleUserClick} />
      </Box>
    </Box>
  );
};

export default TravelersSearchPage;
