package com.tripmates.backend.users.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

public record MenuItemUpdateDTO(
        @Schema(description = "Menu's item photos to delete by 0-based indexes") List<Integer> deletePhotoIndexes,
        @Schema(description = "Menu's item food name") String foodName,
        @Schema(description = "Menu's item price") Float price,
        @Schema(description = "Menu's item description") String description
) {
}
