import React from "react";
import { Box } from "@mui/material";
import { SEARCH_TRAVELERS_BACKGROUND } from "../../constants/DefaultImages";

interface Props {
  index: number;
}

const BackgroundRotator: React.FC<Props> = ({ index }) => (
  <Box
    sx={{
      position: "fixed",
      inset: 0,
      "&::before": {
        content: '""',
        position: "absolute",
        inset: 0,
        backgroundImage: `url(${SEARCH_TRAVELERS_BACKGROUND[index]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "blur(5px)",
        zIndex: 1,
      },
      "&::after": {
        content: '""',
        position: "absolute",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.45)",
        zIndex: 2,
      },
      transition: "background-image 1s ease-in-out",
      zIndex: 0,
    }}
  />
);

export default BackgroundRotator;
