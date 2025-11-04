import React, { useState, useEffect } from 'react';
import { Grid, Typography, Card, CardContent, CardMedia, Avatar, Chip, Stack } from '@mui/material';
import type { Review } from '../../../types/review';
import { useAuth } from '../../../hooks/useAuth';
import { getReviewsForUser } from '../../../services/reviewService';
import { mapReviewListDTOToReviews } from '../../../services/mappers/reviewsMapper';
import { EmptyState } from '../EmptyState';
import { ReviewGrid } from '../../reviews/ReviewGrid';

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
    <ReviewGrid items={reviews} />
  );
}