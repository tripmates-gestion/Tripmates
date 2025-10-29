package com.tripmates.backend.publications.dto;

import com.tripmates.backend.common.types.AttentionSchedule;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

public record BusinessPublicationRequestDTO(<<<<<<<HEAD @Schema(description="Publication title")@NotBlank(message="The title cannot be empty to create a business publication.")
String title,
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
List<DayOfWeek> openingDays, // quizás
								// una
								// lista
								// de
								// tuplas
								// de
								// horario
								// con
								// día
@Schema(description = "Service/host opening hours")
AttentionSchedule attentionSchedule,
@Schema(description = "Service/host exceptional closing days")
List<LocalDate> exceptionalClosingDays)
{
=======
        @Schema(description = "Publication title") @NotBlank(message = "The title cannot be empty to create a business publication.") String title,

        @Schema(description = "Business publication description text") @NotBlank(message = "The description cannot be empty to create a business publication.") String description,

        @Schema(description = "Business publication phone number") String phoneNumber,

        @Schema(description = "Business publication email") @Email(message = "The provided email is not valid.") String email,

        @Schema(description = "Business publication location") String location,

        @Schema(description = "Business opening days") List<DayOfWeek> openingDays, // quizás una lista de tuplas de
                                                                                    // horario
                                                                                    // con día

        @Schema(description = "Business opening hours") AttentionSchedule attentionSchedule,

        @Schema(description = "Business exceptional closing days") List<LocalDate> exceptionalClosingDays,

        @Schema(description = "Business publication tags") List<String> tags

) {
>>>>>>> origin/dev-front
}
