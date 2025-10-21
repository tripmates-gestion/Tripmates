package com.tripmates.backend.users.dto;

import org.springframework.validation.annotation.Validated;

import com.tripmates.backend.users.entity.Role;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Data Transfer Object (DTO) utilizado para recibir los datos en formato JSON,
 * necesarios para crear un nuevo usuario.
 *
 * @param username nombre de usuario
 * @param email email del usuario
 * @param password contraseña del usuario
 * @param description descripción o biografía del usuario
 * @param role rol del usuario
 * @param avatarURL URL del avatar del usuario
 */
@Validated
public record UserCreationRequestDTO(
        @Schema(description = "User's username")
        @NotBlank(message = "The username cannot be empty to register a user.")
        @Size(min = 3, max = 50, message = "The username must be between 3 and 50 characters.")
        String username,

        @Schema(description = "User's email")
        @NotBlank(message = "The user's email cannot be empty to register a user.")
        @Email(message = "The provided email is not valid.")
        String email,

        @Schema(description = "User's password")
        @NotBlank(message = "The user's password cannot be empty to register a user.")
        String password,

        @Schema(description = "User's description or biography (optional)")
        @Size(max = 500, message = "The description cannot exceed 500 characters.")
        String description,

        @Schema(description = "User's role")
        @NotBlank(message = "The user role cannot be empty to register a user.")
        Role role,

        @Schema(description = "User's avatar URL (optional)")
        String avatarURL
) { }