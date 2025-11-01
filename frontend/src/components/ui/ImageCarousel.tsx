// src/components/ui/ImageCarousel.tsx
import * as React from "react";
import { Box, IconButton, Stack } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";

export interface ImageCarouselProps {
  images: string[];
  alt?: string;
  height?: number;
  autoPlay?: boolean;
  interval?: number;
}

export default function ImageCarousel({
  images,
  alt = "imagen",
  height = 380,
  autoPlay = false,
  interval = 4000,
}: ImageCarouselProps) {
  const [index, setIndex] = React.useState(0);
  const max = images.length;

  const next = React.useCallback(() => {
    setIndex((i) => (i + 1) % max);
  }, [max]);

  const prev = React.useCallback(() => {
    setIndex((i) => (i - 1 + max) % max);
  }, [max]);

  // autoplay opcional
  React.useEffect(() => {
    if (!autoPlay) return;
    const id = setInterval(() => next(), interval);
    return () => clearInterval(id);
  }, [autoPlay, interval, next]);

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height,
        overflow: "hidden",
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      {/* Contenedor deslizante */}
      <Box
        sx={{
          display: "flex",
          width: `${max * 100}%`,
          transform: `translateX(-${index * (100 / max)}%)`,
          transition: "transform 0.6s ease-in-out",
        }}
      >
        {images.map((src, i) => (
          <Box
            key={i}
            component="img"
            src={src}
            alt={`${alt} ${i + 1}`}
            sx={{
              width: `${100 / max}%`,
              height,
              objectFit: "cover",
              userSelect: "none",
              flexShrink: 0,
            }}
          />
        ))}
      </Box>

      {/* Botones de navegación */}
      {max > 1 && (
        <>
          <IconButton
            onClick={prev}
            sx={(t) => ({
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor:
                t.palette.mode === "dark"
                  ? "rgba(255,255,255,0.2)"
                  : "rgba(255,255,255,0.7)",
              "&:hover": {
                bgcolor:
                  t.palette.mode === "dark"
                    ? "rgba(255,255,255,0.35)"
                    : "rgba(255,255,255,0.9)",
              },
            })}
          >
            <ArrowBackIos fontSize="small" />
          </IconButton>

          <IconButton
            onClick={next}
            sx={(t) => ({
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor:
                t.palette.mode === "dark"
                  ? "rgba(255,255,255,0.2)"
                  : "rgba(255,255,255,0.7)",
              "&:hover": {
                bgcolor:
                  t.palette.mode === "dark"
                    ? "rgba(255,255,255,0.35)"
                    : "rgba(255,255,255,0.9)",
              },
            })}
          >
            <ArrowForwardIos fontSize="small" />
          </IconButton>

          {/* Indicadores inferiores */}
          <Stack
            direction="row"
            spacing={1}
            sx={{
              position: "absolute",
              bottom: 10,
              left: 0,
              right: 0,
              justifyContent: "center",
            }}
          >
            {images.map((_, i) => (
              <Box
                key={i}
                sx={(t) => ({
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor:
                    i === index
                      ? "primary.main"
                      : t.palette.mode === "dark"
                      ? "grey.600"
                      : "grey.300",
                  transition: "background-color 0.3s",
                })}
              />
            ))}
          </Stack>
        </>
      )}
    </Box>
  );
}
