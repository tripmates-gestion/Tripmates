import React from "react";
import { Typography } from "@mui/material";

const SearchHeader: React.FC = () => (
  <>
    <Typography
      variant="h2"
      sx={{
        fontWeight: 600,
        mb: 2,
        textAlign: "center",
        color: "white",
        letterSpacing: "-0.5px",
        textShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
      }}
    >
      Conectá con otros viajeros
    </Typography>
    <Typography
      variant="h6"
      sx={{
        mb: 4,
        color: "rgba(255,255,255,0.9)",
        maxWidth: 700,
        lineHeight: 1.4,
      }}
    >
      Conoce viajeros que conozcan de tu nuevo destino. Busca y comparte la experiencia con tus amigos!
    </Typography>

  </>
);

export default SearchHeader;
