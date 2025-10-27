package com.tripmates.backend.users.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

import java.util.List;
import com.tripmates.backend.publications.entity.AttentionSchedule;
import java.time.DayOfWeek;
import java.time.LocalDate;

@Schema(description = "User update request DTO")
public record UserUpdateRequestDTO(
        @Schema(description = "User's username")
        @NotBlank(message = "Username cannot be empty")
        String name,

        @Schema(description = "User's description or bio")
        String description,

        @Schema(description = "User's avatar URL")
        String avatarURL,

        @Schema(description = "User's opening days")
        List<DayOfWeek> openingDays,

        @Schema(description = "User's attention schedule")
        AttentionSchedule attentionSchedule,

        @Schema(description = "User's exceptional closing days")
        List<LocalDate> exceptionalClosingDays,

        @Schema(description = "User's phone number")
        String phoneNumber,

        @Schema(description = "User's location")
        String location,

        @Schema(description = "User's profile image URLs")
        List<String> profileImageUrls
) { }