import type { Review, ReviewListDTO, ReviewDTO } from '../../types/review';

/**
 * Mapea un ReviewDTO a Review
 */
export function mapReviewDTOToReview(dto: ReviewDTO): Review {
  return {
    id: dto.reviewId,
    author: dto.reviewerUsername,
    title: dto.title,
    rating: dto.rating,
    text: dto.content,
    images: dto.imageUrls,
    createdAt: new Date().toISOString(), // Si no viene fecha en el DTO, usar actual
    publicationId: dto.publicationReviewed.id,
    publicationTitle: dto.publicationReviewed.title,
  };
}

/**
 * Mapea un ReviewListDTO a una lista de Review
 */
export function mapReviewListDTOToReviews(dto: ReviewListDTO): Review[] {
  return dto.reviews.map(mapReviewDTOToReview);
}

/**
 * Mapea una lista de ReviewDTO directamente a Review[]
 */
export function mapReviewDTOsToReviews(dtos: ReviewDTO[]): Review[] {
  return dtos.map(mapReviewDTOToReview);
}