package com.tripmates.backend.publications.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import com.tripmates.backend.common.constants.ValidationErrorMessage;

public class ReviewCreationRequestDTO {
    @Schema(description = "Reviewed publication id") String publicationId;
    @Schema(description = "Review title") @NotBlank(message = ValidationErrorMessage.REVIEW_TITLE_BLANK) String title;
    @Schema(description = "Review content") @NotBlank(message = ValidationErrorMessage.REVIEW_CONTENT_BLANK) String content;
    @Schema(description = "Review rating")@Min(value = (long) 0.5, message = ValidationErrorMessage.REVIEW_RATING_MIN) @Max(value = (long) 5.0, message = ValidationErrorMessage.REVIEW_RATING_MAX) Long rating;
}
