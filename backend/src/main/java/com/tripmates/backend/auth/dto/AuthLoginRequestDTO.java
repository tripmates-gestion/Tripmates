package com.tripmates.backend.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.validation.annotation.Validated;

@Validated
public record AuthLoginRequestDTO(
		@Schema(description = "User's email") @NotBlank(
				message = "The user's email cannot be empty to register a user.") @Email(
						message = "The provided email is not valid.") String email,
		@Schema(description = "User's password") @NotBlank(
				message = "The user's password cannot be empty to register a user.") String password) {
}
