package com.tripmates.backend.common.types;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

public record MenuItem(@Schema(description = "Menu's item photos") List<String> photosURLs,
		@Schema(description = "Menu's item food name") String foodName,
		@Schema(description = "Menu's item price") Float price,
		@Schema(description = "Menu's item description") String description) {
}
