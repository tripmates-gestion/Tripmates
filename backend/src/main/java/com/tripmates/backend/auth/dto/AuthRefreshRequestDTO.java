package com.tripmates.backend.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.validation.annotation.Validated;

@Validated
public record AuthRefreshRequestDTO(
        @Schema(description = "User's email") @NotBlank(message = "The user's email cannot be empty to register a user.")
        @Email String email,

        @Schema(description = "User's refresh token") @NotBlank(message = "The user's refresh token cannot be empty")
        String refreshToken
) { }
