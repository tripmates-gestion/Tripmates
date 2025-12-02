package com.tripmates.backend.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "Reset password DTO")
public record ResetPasswordDTO(
		@Schema(description = "User's email", example = "user@example.com") @NotBlank(
				message = "Email is required") @Email(message = "Invalid email format") String email,
		@Schema(description = "6-digit reset code", example = "123456") @NotBlank(
				message = "Code is required") @Pattern(regexp = "^[0-9]{6}$",
						message = "Code must be 6 digits") String code,
		@Schema(description = "New password", example = "newPassword123") @NotBlank(
				message = "Password is required") @Size(min = 8,
						message = "Password must be at least 8 characters long") String newPassword) {
}
