package com.tripmates.backend.publications.dto;

import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import com.tripmates.backend.common.types.AttentionSchedule;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

public record PublicationUpdateRequestDTO(
		@Schema(description = "Publication's title (optional for update)") String title,
		@Schema(description = "Business publication description text (optional for update)") String description,
		@Schema(description = "Business publication phone number") String phoneNumber,
		@Schema(description = "Business publication email") String email,
		@Schema(description = "Business publication location") String location,
		@Schema(description = "Business opening days") @JsonSetter(nulls = Nulls.AS_EMPTY) List<DayOfWeek> openingDays,
		@Schema(description = "Business opening hours") AttentionSchedule attentionSchedule,
		@Schema(description = "Business exceptional closing days") @JsonSetter(
				nulls = Nulls.AS_EMPTY) List<LocalDate> exceptionalClosingDays,
		@Schema(description = "Business publication tags") @JsonSetter(nulls = Nulls.AS_EMPTY) List<String> tags,
		@Schema(description = "Optional list of 0-based photo indexes to delete from the publication") @JsonSetter(
				nulls = Nulls.AS_EMPTY) List<Integer> deletePhotoIndexes) {
}
