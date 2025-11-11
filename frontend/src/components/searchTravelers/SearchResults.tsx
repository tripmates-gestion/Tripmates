/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import TravelerCard from "./TravelerCard";

interface Props {
  results: any[];
  onUserClick: (user: any) => void;
}

const SearchResults: React.FC<Props> = React.memo(({ results, onUserClick }) => {
  if (results.length === 0){
    return
  }
  console.log("Resultados devueltos por el back en busqueda de usuarios", results);
  return (
    <Box sx={{ width: "100%", maxWidth: 800, mt: 5, px: { xs: 2, sm: 4 } }}>
      <Typography variant="h6" sx={{ mb: 2, color: "white" }}>
        Resultados de búsqueda:
      </Typography>
      <Stack spacing={2}>
        {results.map((user) => (
          <TravelerCard key={user.id} user={user} onClick={() => onUserClick(user)} />
        ))}
      </Stack>
    </Box>
  );
});

export default SearchResults;
