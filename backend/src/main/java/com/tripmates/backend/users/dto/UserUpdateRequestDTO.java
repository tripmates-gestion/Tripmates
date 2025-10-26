package com.tripmates.backend.users.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "User update request DTO")
public record UserUpdateRequestDTO(
        @Schema(description = "User's username")
        String username,

        @Schema(description = "User's description or bio")
        String description,

        @Schema(description = "User's avatar URL")
        String avatarURL
) { }