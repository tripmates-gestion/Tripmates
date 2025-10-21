package com.tripmates.backend.users.dto;

import com.tripmates.backend.users.entity.Role;
import com.tripmates.backend.users.entity.mongo.User;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "User profile response DTO")
public record UserProfileResponseDTO(
        @Schema(description = "User's unique identifier")
        String id,

        @Schema(description = "User's username")
        String username,

        @Schema(description = "User's email")
        String email,

        @Schema(description = "User's role")
        Role role,

        @Schema(description = "User's description or bio")
        String description,

        @Schema(description = "User's avatar URL")
        String avatarURL
) {
    public UserProfileResponseDTO(User user) {
        this(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getRole(),
            user.getDescription(),
            user.getAvatarURL() // ahora coincide
        );
    }
}
