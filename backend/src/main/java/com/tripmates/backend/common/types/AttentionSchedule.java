package com.tripmates.backend.common.types;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalTime;

public record AttentionSchedule(
		@Schema(description = "Restaurant's opening time") @JsonFormat(
				pattern = "HH:mm") @JsonProperty("openingTime") LocalTime openingTime,
		@Schema(description = "Restaurant's closing time") @JsonFormat(
				pattern = "HH:mm") @JsonProperty("closingTime") LocalTime closingTime) {
}
