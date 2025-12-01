package com.tripmates.backend.publications.dto;

import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;

import com.tripmates.backend.common.constants.ValidationErrorMessage;

import java.util.List;

public record ReviewCreationRequestDTO(
		@Schema(description = "Review title") @NotBlank(
				message = ValidationErrorMessage.REVIEW_TITLE_BLANK) String title,
		@Schema(description = "Review content") @NotBlank(
				message = ValidationErrorMessage.REVIEW_CONTENT_BLANK) String content,
		@Schema(description = "Review rating") @Min(value = 0, message = ValidationErrorMessage.REVIEW_RATING_MIN) @Max(
				value = 5, message = ValidationErrorMessage.REVIEW_RATING_MAX) Double rating,
		@Schema(description = "Review's mentions") @JsonSetter(nulls = Nulls.AS_EMPTY) List<String> mentions) {
}
