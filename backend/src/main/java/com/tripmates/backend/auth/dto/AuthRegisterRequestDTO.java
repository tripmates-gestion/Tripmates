package com.tripmates.backend.auth.dto;

import org.springframework.validation.annotation.Validated;
import com.tripmates.backend.users.entity.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.tripmates.backend.common.constants.ValidationErrorMessage;

import com.tripmates.backend.common.types.BusinessType;

/**
 * Data Transfer Object (DTO) utilizado para recibir los datos en formato JSON, necesarios
 * para crear un nuevo usuario.
 *
 * @param name nombre de usuario
 * @param email email del usuario
 * @param password contraseña del usuario
 * @param description descripción o biografía del usuario
 * @param role rol del usuario
 * @param avatarURL URL del avatar del usuario
 * @param businessType tipo de negocio (Solo para usuarios de negocio)
 */
@Validated
public record AuthRegisterRequestDTO(
		@Schema(description = "User's username") @NotBlank(
				message = ValidationErrorMessage.EMPTY_OR_NULL_FIELD + "name") String name,

		@Schema(description = "User's email") @NotBlank(
				message = ValidationErrorMessage.EMPTY_OR_NULL_FIELD + "email") @Email(
						message = ValidationErrorMessage.INVALID_EMAIL) String email,

		@Schema(description = "User's password") @NotBlank(
				message = ValidationErrorMessage.EMPTY_OR_NULL_FIELD + "password") String password,

		@Schema(description = "User's role") @NotNull(
				message = ValidationErrorMessage.EMPTY_OR_NULL_FIELD + "role") Role role,

		@Schema(description = "User's business type (Just for business users)") BusinessType businessType

) {
}