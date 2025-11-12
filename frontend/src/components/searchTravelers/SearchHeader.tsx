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
      Buscá personas que comparten tu pasión por viajar. Descubrí sus
      experiencias, reviews y aventuras por el mundo.
    </Typography>
  </>
);

export default SearchHeader;
