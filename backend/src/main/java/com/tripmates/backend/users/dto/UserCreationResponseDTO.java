package com.tripmates.backend.users.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record UserCreationResponseDTO(
        @Schema(description = "User's access token") @NotBlank(message = "The user's access token cannot be empty.")
        String accessToken,

        @Schema(description = "User's refresh token") @NotBlank(message = "The user's refresh token cannot be empty.")
        String refreshToken
) {
}
