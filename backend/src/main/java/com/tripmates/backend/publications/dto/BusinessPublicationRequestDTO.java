package com.tripmates.backend.publications.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import com.tripmates.backend.publications.entity.AttentionSchedule;
import com.tripmates.backend.publications.entity.BusinessPublicationType;
import java.time.DayOfWeek;
import java.time.LocalDate;

public record BusinessPublicationRequestDTO(
    @Schema(description = "Publication title")
    @NotBlank(message = "The title cannot be empty to create a business publication.")
    String title,

    @Schema(description = "Publication type")
    @NotBlank(message = "The type cannot be empty to create a business publication.")
    BusinessPublicationType type,

    @Schema(description = "Service/host description text")
    @NotBlank(message = "The description cannot be empty to create a business publication.")
    String description,

    @Schema(description = "service/host phone number")
    String phoneNumber,

    @Schema(description = "service/host email")
    @Email(message = "The provided email is not valid.")
    String email,

    @Schema(description = "service/host location")
    String location,

    @Schema(description = "Service/host opening days")
    List<DayOfWeek> openingDays,//quizás una lista de tuplas de horario con día

    @Schema(description = "Service/host opening hours")
    AttentionSchedule attentionSchedule,

    @Schema(description = "Service/host exceptional closing days")
    List<LocalDate> exceptionalClosingDays
) {
  }
