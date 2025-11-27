// src/components/ui/HeroImageSlider.tsx
import * as React from 'react';
import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

export interface HeroImageSliderProps {
  images: string[];
  alt?: string;
  interval?: number;
  aspectRatio?: number;        // por defecto 4/3
  rounded?: number;            // borderRadius MUI (default 4)
  fit?: 'cover' | 'contain' | 'scale-down';
}

export default function HeroImageSlider({
  images,
  alt = 'Imagen de viaje',
  interval = 4500,
  aspectRatio = 4 / 3,
  rounded = 4,
  fit = 'cover',
}: HeroImageSliderProps) {
  const hasLoop = images.length > 1;

  // Si solo hay una imagen, no hacemos nada raro
  if (!hasLoop) {
    return (
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          borderRadius: rounded,
          boxShadow: 4,
          bgcolor: 'background.default',
          aspectRatio,
        }}
      >
        {images[0] && (
          <Box
            component="img"
            src={images[0]}
            alt={alt}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: fit,
              objectPosition: 'center',
              display: 'block',
              userSelect: 'none',
            }}
          />
        )}
      </Box>
    );
  }

  // Tenemos más de una imagen: armamos [last, ...images, first]
  const extended = React.useMemo(
    () => [images[images.length - 1], ...images, images[0]],
    [images]
  );
  const total = extended.length; // n + 2

  const [index, setIndex] = React.useState(1); // empezamos en la primera "real"
  const [isTransitioning, setIsTransitioning] = React.useState(true);

  // Autoplay
  React.useEffect(() => {
    const id = setInterval(() => {
      setIsTransitioning(true);
      setIndex((prev) => prev + 1);
    }, interval);

    return () => clearInterval(id);
  }, [interval]);

  // Cuando termina la transición y estamos en el clon del último (extended[last])
  const handleTransitionEnd = () => {
    // índice del clon de la primera imagen real
    const lastCloneIndex = total - 1;

    if (index === lastCloneIndex) {
      // apagamos transición y saltamos "silenciosamente" a la primera real (1)
      setIsTransitioning(false);
      setIndex(1);
    }

    // (Opcionalmente podrías hacer lo mismo si quisieras un loop hacia el otro lado:
    //  si index === 0 → saltar a total - 2, pero acá nunca vamos para atrás)
  };

  // Reencendemos la transición después de teletransportar
  React.useEffect(() => {
    if (!isTransitioning && index === 1) {
      const id = setTimeout(() => {
        setIsTransitioning(true);
      }, 50);
      return () => clearTimeout(id);
    }
  }, [isTransitioning, index]);

  const containerSx: SxProps<Theme> = {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    borderRadius: rounded,
    boxShadow: 4,
    bgcolor: 'background.default',
    aspectRatio,
  };

  return (
    <Box sx={containerSx}>
      <Box
        onTransitionEnd={handleTransitionEnd}
        sx={{
          display: 'flex',
          width: `${total * 100}%`,
          height: '100%',
          transform: `translateX(-${(index * 100) / total}%)`,
          transition: isTransitioning ? 'transform 0.7s ease-in-out' : 'none',
        }}
      >
        {extended.map((src, i) => (
          <Box
            key={i}
            component="img"
            src={src}
            alt={`${alt} ${i + 1}`}
            sx={{
              width: `${100 / total}%`,
              height: '100%',
              objectFit: fit,
              objectPosition: 'center',
              userSelect: 'none',
              flexShrink: 0,
              display: 'block',
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
