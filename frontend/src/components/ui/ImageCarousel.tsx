// src/components/ui/ImageCarousel.tsx
import * as React from "react";
import { Box, IconButton, Stack } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import type { SxProps, Theme } from "@mui/material/styles";

export interface ImageCarouselProps {
  images: string[];
  alt?: string;
  height?: number;
  autoPlay?: boolean;
  interval?: number;
  fit?: "cover" | "contain" | "scale-down";
  aspectRatio?: number;
  rounded?: number;
}

export default function ImageCarousel({
  images,
  alt = "imagen",
  // height ahora es opcional: si no viene, usamos aspectRatio
  height,
  autoPlay = false,
  interval = 4000,
  fit = "contain",
  aspectRatio,
  rounded = 8,
}: ImageCarouselProps) {
  const [index, setIndex] = React.useState(0);
  const max = images.length;

  const next = React.useCallback(() => setIndex((i) => (i + 1) % max), [max]);
  const prev = React.useCallback(() => setIndex((i) => (i - 1 + max) % max), [max]);

  React.useEffect(() => {
    if (!autoPlay || max < 2) return;
    const id = setInterval(next, interval);
    return () => clearInterval(id);
  }, [autoPlay, interval, next, max]);

  const useAspect = aspectRatio != null;          // true si pasaste aspectRatio
  const heightFallback = height ?? 380;           // si no pasás height, usamos 380

  const containerSx: SxProps<Theme> = {
    position: "relative",
    width: "100%",
    overflow: "hidden",
    borderRadius: rounded,
    boxShadow: 3,
    bgcolor: "background.default",
    ...(useAspect ? { aspectRatio } : { height: heightFallback }),
  };

  return (
    <Box sx={containerSx}>
      <Box
        sx={{
          display: "flex",
          width: `${max * 100}%`,
          height: "100%",
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
            onError={(e: any) => (e.currentTarget.style.visibility = "hidden")}
            sx={{
              width: `${100 / max}%`,
              height: "100%",
              objectFit: fit,
              objectPosition: "center",
              userSelect: "none",
              flexShrink: 0,
              display: "block",
            }}
          />
        ))}
      </Box>

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
