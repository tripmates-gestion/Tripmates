/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import ReviewCard from "./ReviewCard";

interface Props {
  reviews: any[];
  onNavigateBusiness: (userId: string) => void;
}

const TravelerReviewsGrid: React.FC<Props> = ({ reviews, onNavigateBusiness }) => {
  if (reviews.length === 0)
    return (
      <Typography variant="body1" color="text.secondary">
        Este viajero aún no publicó reviews.
      </Typography>
    );

  return (
    <Box sx={{ maxWidth: 1200, width: "100%", mx: "auto" }}>
      <Typography
        variant="h5"
        fontWeight={600}
        justifyContent="center"
        sx={{
          color: "gray",
          mb: 4,
          textAlign: "center",
          pl: 1,
          fontFamily: "'Poppins', sans-serif, italic",
        }}
      >
        Experiencias compartidas
      </Typography>

      <Grid
        container
        spacing={4}
        justifyContent="center"
        sx={{ perspective: 1000 }}
      >
        {reviews.map((review, i) => (
          <Grid item xs={12} sm={6} md={4} key={review.reviewId}>
            <ReviewCard
              review={review}
              onNavigateBusiness={onNavigateBusiness}
              rotation={i % 2 === 0 ? -2 : 3} // leve inclinación
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TravelerReviewsGrid;
