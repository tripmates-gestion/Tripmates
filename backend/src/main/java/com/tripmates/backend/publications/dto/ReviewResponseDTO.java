package com.tripmates.backend.publications.dto;

import com.tripmates.backend.common.types.Review;
import com.tripmates.backend.publications.entity.mongo.Publication;
import com.tripmates.backend.users.entity.mongo.Account;
import java.util.List;

public record ReviewResponseDTO(String reviewId, BusinessPublicationResponseDTO publicationReviewed, String title,
		String content, Double rating, List<String> imageUrls, String reviewerId, String reviewerUsername,
		String reviewerAvatarUrl) {
	public static ReviewResponseDTO fromEntities(Review review, Publication publicationReviewed, Account reviewer) {
		return new ReviewResponseDTO(review.getReviewId(),
				BusinessPublicationResponseDTO.fromPublication(publicationReviewed), review.getTitle(),
				review.getContent(), review.getRating(), review.getImageUrls(), reviewer.getId(),
				reviewer.getUsername(), reviewer.getAvatarURL());
	}
}
