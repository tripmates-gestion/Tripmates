package com.tripmates.backend.users.dto;

import com.tripmates.backend.users.entity.Role;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import org.springframework.validation.annotation.Validated;

@Validated
public record UserUpdateProfileResponseDTO(
        @Schema(description = "User's username")
        String username,

        @Schema(description = "User's email")
        @Email String email,

        @Schema(description = "User's role")
        Role role,

        @Schema(description = "User's description")
        String description,

        @Schema(description = "User's avatar URL")
        String avatarURL
) { }
