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
import DefaultTravelersSection from "../components/searchTravelers/DefaultTravelersSection";
import { getTravelersRecommendations } from "../services/recommendations";

const TravelersSearchPage: React.FC = () => {
  const authContext = useAuth();

  const theme = useTheme();
  const [bgIndex, setBgIndex] = useState(0);

  // Initialize state from sessionStorage if available
  const [searchTerm, setSearchTerm] = useState(() => {
    return sessionStorage.getItem("travelersSearchTerm") || "";
  });
  const [searchType, setSearchType] = useState<"name" | "location">(() => {
    return (sessionStorage.getItem("travelersSearchType") as "name" | "location") || "name";
  });
  const [results, setResults] = useState<any[]>(() => {
    const savedResults = sessionStorage.getItem("travelersSearchResults");
    return savedResults ? JSON.parse(savedResults) : [];
  });

  // Persist state changes
  useEffect(() => {
    sessionStorage.setItem("travelersSearchTerm", searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    sessionStorage.setItem("travelersSearchType", searchType);
  }, [searchType]);

  useEffect(() => {
    sessionStorage.setItem("travelersSearchResults", JSON.stringify(results));
  }, [results]);
  const navigate = useNavigate();

  const [defaultUsers, setDefaultUsers] = useState<any[]>([]);
  const [loadingDefault, setLoadingDefault] = useState(true);

  const fetchDefaultUsers = useCallback(async () => {
    if (!authContext.accessToken) return;
    console.log("Fetching default users with accessToken:", authContext.accessToken);
    try {
      setLoadingDefault(true);
      // getTravelersRecommendations ya devuelve el array directamente
      if (authContext.user?.id) {
        const users = await getTravelersRecommendations(authContext.user.id, authContext.accessToken);
        console.log("Usuarios por defecto:", users);
        // Cambiar de response?.content a users directamente
        if (Array.isArray(users)) {
          setDefaultUsers(users.slice(0, 5)); // Tomar solo 5
        }
      }
    } catch (error) {
      console.error('Error fetching default users:', error);
    } finally {
      setLoadingDefault(false);
    }
  }, [authContext.accessToken, authContext.user?.id]);

  useEffect(() => {
    if (authContext.accessToken) {
      fetchDefaultUsers();
    }
  }, [authContext.accessToken, fetchDefaultUsers]);


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

    if (searchType === "name") {
      const response = await searchTravelers(authContext.accessToken, searchTerm, null);
      if (response != null) {
        resultsSearch.push(...response.content);
      }
    } else {
      const response = await searchTravelers(authContext.accessToken, null, searchTerm);
      if (response != null) {
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
        {/* Mostrar usuarios por defecto solo si no hay resultados de búsqueda */}

        {/* Mostrar resultados de búsqueda */}
        <SearchResults results={results} onUserClick={handleUserClick} />

        {/* Mostrar siempre viajeros sugeridos, incluso si hay resultados guardados */}
        <DefaultTravelersSection
          loadingDefault={loadingDefault}
          defaultUsers={defaultUsers}
          bgColor={bgColor}
          handleUserClick={handleUserClick}
        />
      </Box>
    </Box>
  );
};

export default TravelersSearchPage;
