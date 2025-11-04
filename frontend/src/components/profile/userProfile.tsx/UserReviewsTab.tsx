import React, { useState, useEffect } from 'react';
import { Grid, Typography, Card, CardContent, CardMedia, Avatar, Chip, Stack } from '@mui/material';
import type { Review, ReviewListDTO } from '../../../types/review';
import { useAuth } from '../../../hooks/useAuth';
import { getReviewsForUser } from '../../../services/reviewService';
import { mapReviewListDTOToReviews } from '../../../services/mappers/reviewsMapper';
import { EmptyState } from '../EmptyState';

export default function UserReviewsTab() {

  const { user, accessToken } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        console.log(user.id);
        const reviewsDTO = await getReviewsForUser(accessToken, user.id);
        const reviews = mapReviewListDTOToReviews(reviewsDTO);
        setReviews(reviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    if (user?.id) {
      fetchReviews();
    }
  }, [accessToken, user?.id]);

  if (reviews.length === 0) {
    return <EmptyState title="Dejá tus opiniones en las publicaciones para verlas acá." />;
  }

  return (
    <Grid container spacing={2}>
      {reviews.map((r: Review) => (
        <Grid key={r.id} item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                <Avatar>{r.author.slice(0, 1).toUpperCase()}</Avatar>
                <Stack spacing={0}>
                  <Typography variant="subtitle2" fontWeight={700}>{r.author}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(r.createdAt).toLocaleString()}
                  </Typography>
                </Stack>
                {!!r.rating && (
                  <Chip
                    size="small"
                    label={<><strong>{r.rating.toFixed(1)}</strong> ★</>}
                    sx={{ ml: "auto" }}
                  />
                )}
              </Stack>

              {/* Referencia a la publicación (opcional) */}
              {r.publicationTitle && (
                <Chip
                  label={`Sobre: ${r.publicationTitle}`}
                  size="small"
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
              )}

              {/* Título + texto */}
              <Typography variant="subtitle1" fontWeight={700}>{r.title}</Typography>
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{r.text}</Typography>

              {/* Galería */}
              {r.images.length > 0 && (
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  {r.images.map((img: string, i: number) => (
                    <Grid key={i} item xs={6} sm={4} md={3}>
                      <Card variant="outlined" sx={{ position: "relative" }}>
                        <CardMedia component="img" image={img} height={120} />
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}