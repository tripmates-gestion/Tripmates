package com.tripmates.backend.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import org.springframework.validation.annotation.Validated;

@Validated
public record AuthLoginResponseDTO(
		@Schema(description = "User's access token") @NotBlank(
				message = "The user's access token cannot be empty.") String accessToken,
		@Schema(description = "User's refresh token") @NotBlank(
				message = "The user's refresh token cannot be empty.") String refreshToken) {
}
