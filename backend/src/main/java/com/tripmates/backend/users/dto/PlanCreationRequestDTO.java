package com.tripmates.backend.users.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import org.springframework.validation.annotation.Validated;

@Validated
public record PlanCreationRequestDTO(
		@Schema(description = "Plan's name") @NotNull String name,
		@Schema(description = "Plan's description") String description
) {}
