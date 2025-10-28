package com.tripmates.backend.common.types;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalTime;

public record AttentionSchedule(@JsonFormat(pattern = "HH:mm") LocalTime openingTime,
		@JsonFormat(pattern = "HH:mm") LocalTime closingTime) {
}
