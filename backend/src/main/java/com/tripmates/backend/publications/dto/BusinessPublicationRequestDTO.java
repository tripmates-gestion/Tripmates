package com.tripmates.backend.publications.dto;

import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import com.tripmates.backend.common.types.AttentionSchedule;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import com.tripmates.backend.common.constants.ValidationErrorMessage;

public record BusinessPublicationRequestDTO(
		@Schema(description = "Publication title") @NotBlank(
				message = ValidationErrorMessage.EMPTY_OR_NULL_FIELD) String title,

		@Schema(description = "Business publication description text") @NotBlank(
				message = ValidationErrorMessage.EMPTY_OR_NULL_FIELD) String description,

		@Schema(description = "Business publication phone number") String phoneNumber,

		@Schema(description = "Business publication email") @Email(
				message = ValidationErrorMessage.INVALID_EMAIL) String email,

		@Schema(description = "Business publication location") String location,

		@Schema(description = "Business opening days") @JsonSetter(nulls = Nulls.AS_EMPTY) List<DayOfWeek> openingDays,

		@Schema(description = "Business opening hours") AttentionSchedule attentionSchedule,

		@Schema(description = "Business exceptional closing days") @JsonSetter(
				nulls = Nulls.AS_EMPTY) List<LocalDate> exceptionalClosingDays,

		@Schema(description = "Business publication tags") @JsonSetter(nulls = Nulls.AS_EMPTY) List<String> tags

) {
}
