// src/components/searchTravelers/BackgroundLayer.tsx
import React from "react";
import { Box } from "@mui/material";
import BackgroundRotator from "./BackgroundRotator";

interface BackgroundLayerProps {
  bgIndex: number;
}

const BackgroundLayer: React.FC<BackgroundLayerProps> = React.memo(({ bgIndex }) => {
  return (
    <Box sx={{ position: "absolute", inset: 0, zIndex: 1 }}>
      <BackgroundRotator index={bgIndex} />
    </Box>
  );
});

export default BackgroundLayer;
