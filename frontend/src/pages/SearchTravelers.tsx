// src/pages/SearchTravelers.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Box, useTheme } from "@mui/material";
import { SEARCH_TRAVELERS_BACKGROUND } from "../constants/DefaultImages";
import SearchHeader from "../components/searchTravelers/SearchHeader";
import SearchControls from "../components/searchTravelers/SearchControls";
import SearchResults from "../components/searchTravelers/SearchResults";
import { searchTravelers } from "../services/searchService";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from 'react-router-dom';
import { useCallback } from "react";
import BackgroundLayer from "../components/searchTravelers/BackgroundLayer";

const TravelersSearchPage: React.FC = () => {
  const authContext = useAuth();

  const theme = useTheme();
  const [bgIndex, setBgIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<"name" | "location">("name");
  const [results, setResults] = useState<any[]>([]);
  const navigate = useNavigate();


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

  const handleSearch = useCallback(async () => {
    console.log("EJECUTANDO HANDLE SEARCH");
    if (!authContext.accessToken) {
      // Handle the case where there's no access token
      console.error('No access token available');
      return;
    }
    console.log("Renderizando TravelersSearchPage, bgIndex:", bgIndex);
    console.log("accessToken actual:", authContext.accessToken);

    const resultsSearch: any[] = [];
   
    if (searchType==="name") {
      const response = await searchTravelers(authContext.accessToken, searchTerm,null);
      console.log("Respuesta de la busqueda de viajeros",response);

      if (response!=null){
        resultsSearch.push(...response.content);
      }
    } else {
      const response = await searchTravelers(authContext.accessToken, null, searchTerm);
      console.log("Respuesta de la busqueda de viajeros",response);

      if (response!=null){
        resultsSearch.push(...response.content);
      }
    }

    setResults(resultsSearch);
  }, [authContext.accessToken, bgIndex, searchTerm, searchType]);

  const handleUserClick = useCallback((user: any) => {
    console.log("Usuario seleccionado:", user);
    navigate(`/userProfile/${user.id}`, { 
      state: { account: user } 
    });
  }, [navigate]);

  return (
  <Box sx={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
    <BackgroundLayer bgIndex={bgIndex} />
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
