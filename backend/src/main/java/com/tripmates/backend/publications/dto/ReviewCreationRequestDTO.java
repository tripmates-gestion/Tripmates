package com.tripmates.backend.publications.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import com.tripmates.backend.common.constants.ValidationErrorMessage;

public record ReviewCreationRequestDTO(
		@Schema(description = "Review title") @NotBlank(
				message = ValidationErrorMessage.REVIEW_TITLE_BLANK) String title,
		@Schema(description = "Review content") @NotBlank(
				message = ValidationErrorMessage.REVIEW_CONTENT_BLANK) String content,
		@Schema(description = "Review rating") @Min(value = 0, message = ValidationErrorMessage.REVIEW_RATING_MIN) @Max(
				value = 5, message = ValidationErrorMessage.REVIEW_RATING_MAX) Double rating) {
}
