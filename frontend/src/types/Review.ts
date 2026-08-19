export type Review = {
    id: string;
    author: string;
    title: string;
    rating?: number;
    text: string;                // obligatorio
    images: string[];            // opcional (máx. 6)
    createdAt: string;
    publicationId?: string;
    publicationTitle?: string;
    authorId: string;
    authorName: string;
    avatarUrl?: string;
    mentions: string[];        // lista de emails
  };


export type ReviewListDTO = {
    reviews: ReviewDTO[];
};

export type ReviewDTO = {
  reviewId: string,
  publicationReviewed: {
    id: string,
    title: string
  },
  title: string,
  content: string,
  rating?: number,
  imageUrls: string[],
  reviewerId: string,
  reviewerUsername: string,
  reviewerAvatarUrl: string,
  createdAt: string,
  mentions: string[]
}