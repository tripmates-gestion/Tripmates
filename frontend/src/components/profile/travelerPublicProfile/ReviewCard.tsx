// src/components/profile/travelerPublicProfile/ReviewCard.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Rating,
  CardMedia,
  Box,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PublicationCard from "../../publications/PublicationCard"; // ✅ importa la tarjeta reutilizable

interface Props {
  review: any;
  onNavigateBusiness: (userId: string) => void;
  rotation?: number;
}

const ReviewCard: React.FC<Props> = ({
  review,
  onNavigateBusiness,
  rotation = 0,
}) => {
  const [hover, setHover] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [openInfo, setOpenInfo] = useState(false);
  const theme = useTheme();

  const publication = review.publicationReviewed;
  
  const imageUrls =
    review.imageUrls?.length > 0
      ? review.imageUrls
      : publication?.imageUrls || ["/default-place.jpg"];
  console.log("review: ",review);
  console.log("rating: ",review.rating);
  // Rotar imágenes mientras el mouse está encima
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (hover && imageUrls.length > 1) {
      interval = setInterval(() => {
        setCurrentImage((prev) => (prev + 1) % imageUrls.length);
      }, 1500);
    } else {
      setCurrentImage(0);
    }
    return () => clearInterval(interval);
  }, [hover, imageUrls.length]);

  return (
    <>
      <Card
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => setOpenInfo(true)}
        sx={{
          borderRadius:0,
          position: "relative",
          transform: `rotate(${rotation}deg)`,
          transition: "all 0.4s ease",
          backgroundColor: "#fdfcfb",
          boxShadow: "0 8px 15px rgba(0,0,0,0.25)",
          cursor: "pointer",
          width: "100%",
          border: "1px solid #eee",
          "&:hover": {
            transform: "rotate(0deg) scale(1.05)",
            boxShadow: "0 12px 25px rgba(0,0,0,0.35)",
            zIndex: 2,
          },
        }}
      >
        {/* Imagen con efecto de polaroid */}
        <Box
          sx={{
            backgroundColor: "white",
            border: "8px solid white",
            borderBottom: "50px solid white", // borde inferior más grande típico de polaroid
            position: "relative",
            overflow: "hidden",
          }}
        >
          <CardMedia
            component="img"
            image={imageUrls[currentImage]}
            alt={review.title}
            sx={{
              height: 220,
              width: "100%",
              objectFit: "cover",
              transition: "opacity 0.8s ease",
            }}
          />
        </Box>

        {/* Pie con contenido breve */}
        <CardContent
          sx={{
            textAlign: "center",
            backgroundColor: "#fff",
            p: 1.5,
            pt: 0,
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight={600}
            sx={{
              mb: 0.5,
              fontFamily: "'Poppins', sans-serif",
              color: "black",
            }}
          >
            {review.title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              mb: 1,
              fontStyle: "italic",
              minHeight: 36,
              color: "gray",
            }}
          >
            {review.content.length > 80
              ? review.content.slice(0, 80) + "..."
              : review.content}
          </Typography>
          {review.rating && (
            <Rating value={review.rating as number} precision={0.5} readOnly size="small" />
          )}
        </CardContent>
      </Card>

      {/* 📸 Modal con la publicación reutilizando PublicationCard */}
      {publication && (
        <Dialog
          open={openInfo}
          onClose={() => setOpenInfo(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              overflow: "visible",
              p: 1.5,
            },
          }}
          sx={{
            "& .MuiDialog-container": {
              alignItems: "center",
            },
            "& .MuiDialog-paper": {
              margin: "40px auto",
            },
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              pb: 0,
            }}
          >
            <Typography variant="h5" fontWeight={600} align="center">
              Publicación reseñada
            </Typography>
            <IconButton onClick={() => setOpenInfo(false)} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "visible",
            }}
          >
            <Box sx={{ transform: "scale(0.95)", transition: "transform 0.3s" }}>
              <PublicationCard
                publication={publication}
                onView={() => onNavigateBusiness(publication.ownerId)}
                moveOnMouseOver={false}
              />
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default ReviewCard;