package com.tripmates.backend.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Request DTO for password reset")
public record RequestPasswordResetDTO(@Schema(description = "User's email", example = "user@example.com") @NotBlank(
		message = "Email is required") @Email(message = "Invalid email format") String email) {
}
