package com.tripmates.backend.common.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import org.springframework.validation.annotation.Validated;

@Validated
public record ErrorDTO(
		@Schema(description = "Error's type") @NotBlank(message = "Error's type cannot be empty") String type,
		@Schema(description = "Error's title") @NotBlank(message = "Error's title cannot be empty") String title,
		@Schema(description = "Error's status code") @NotBlank(message = "Error's status cannot be empty") int status,
		@Schema(description = "Error's detail message") @NotBlank(
				message = "Error's details cannot be empty") String detail,
		@Schema(description = "Error's endpoint where it occurred") @NotBlank(
				message = "Error's instance cannot be empty") String instance) {
}
