package com.tripmates.backend.publications.dto;

import com.tripmates.backend.common.types.Review;
import com.tripmates.backend.publications.entity.mongo.Publication;
import com.tripmates.backend.users.entity.mongo.Account;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

public record ReviewResponseDTO(@Schema(description = "Review's ID") String reviewId, @Schema(
		description = "Publication resume which the review is done for") PublicationResumeResponseDTO publicationReviewed,
		@Schema(description = "Review's title") String title, @Schema(description = "Review's content") String content,
		@Schema(description = "Review's rating") Double rating,
		@Schema(description = "Review's images URLs") List<String> imageUrls,
		@Schema(description = "User's ID which made the review") String reviewerId,
		@Schema(description = "User's username which made the review") String reviewerUsername,
		@Schema(description = "User's avatar image URL which made the review") String reviewerAvatarUrl) {

	/**
	 * Returns a resume for the review.
	 * @param review review made.
	 * @param publicationReviewed publication which was reviewed.
	 * @param reviewer user which made the review.
	 * @return {@link ReviewResponseDTO}.
	 */
	public static ReviewResponseDTO fromEntities(Review review, Publication publicationReviewed, Account reviewer) {
		return new ReviewResponseDTO(review.getReviewId(),
				PublicationResumeResponseDTO.fromPublication(publicationReviewed), review.getTitle(),
				review.getContent(), review.getRating(), review.getImageUrls(), reviewer.getId(),
				reviewer.getUsername(), reviewer.getAvatarURL());
	}
}
