package com.tripmates.backend.users.dto;

import org.springframework.validation.annotation.Validated;

import com.tripmates.backend.users.entity.Role;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Validated
public record UserCreationRequestDTO(
                @Schema(description = "User's email") @NotBlank(message = "The user's email cannot be empty to register a user.") @Email String email,
                @Schema(description = "User's password") @NotBlank(message = "The user's password cannot be empty to register a user.") String password,
                @Schema(description = "User's role") @NotBlank(message = "The user role cannot be empty to register a user.") Role role) {

}