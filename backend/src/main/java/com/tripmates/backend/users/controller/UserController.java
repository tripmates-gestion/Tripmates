package com.tripmates.backend.users.controller;

import com.tripmates.backend.users.dto.UserResumeResponseDTO;
import com.tripmates.backend.users.dto.UserSearchRequestDTO;
import com.tripmates.backend.users.entity.mongo.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.tripmates.backend.common.dto.ErrorDTO;
import com.tripmates.backend.common.exception.BadRequestException;
import com.tripmates.backend.users.dto.UserUpdateRequestDTO;
import com.tripmates.backend.users.service.UserService;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.springdoc.core.annotations.ParameterObject;

@RestController
@RequestMapping("/users")
@Tag(name = "Users", description = "User management endpoints")
public class UserController {

	private final UserService userService;

	private final ObjectMapper mapper;

	public UserController(UserService userService, ObjectMapper mapper) {
		this.userService = userService;
		this.mapper = mapper;
	}

	@GetMapping("/me")
	@Operation(summary = "Obtains a user from the system")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "User obtained successfully",
					content = {
							@Content(mediaType = "application/json", schema = @Schema(implementation = User.class)) }),
			@ApiResponse(responseCode = "404", description = "User not found", content = {
					@Content(mediaType = "application/json", schema = @Schema(implementation = ErrorDTO.class)) }) })
	public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
		return ResponseEntity.ok().body(userService.getUser(userDetails.getUsername()));
	}

	@PatchMapping(value = "/me", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@Operation(summary = "Update user profile",
			description = "Actualiza el perfil del usuario con datos en JSON e imágenes opcionales.\n\n"
					+ "Estructura de la petición multipart (en este orden):\n"
					+ "- `data`: (obligatorio) JSON con los datos del usuario a actualizar.\n"
					+ "- `avatar`: (opcional) Imagen de avatar principal (JPG, PNG, etc.).\n"
					+ "- `files`: (opcional) Imágenes adicionales del perfil (JPG, PNG, etc.).\n\n"
					+ "Ejemplo de JSON para el campo 'data' (UserUpdateRequestDTO):\n" + "```json\n" + "{\n"
					+ "  \"name\": \"John Doe\",\n" + "  \"description\": \"Travel enthusiast\",\n"
					+ "  \"phoneNumber\": \"+1234567890\",\n" + "  \"location\": \"Main St 123, City\",\n"
					+ "  \"openingDays\": [\"MONDAY\", \"TUESDAY\", \"WEDNESDAY\"],\n"
					+ "  \"attentionSchedule\": { \"openingTime\": \"09:00\", \"closingTime\": \"18:00\" },\n"
					+ "  \"exceptionalClosingDays\": [\"2025-12-25\", \"2026-01-01\"]\n" + "}\n" + "```\n\n"
					+ "Notas:\n" + "- Todos los campos presentes en 'data' son editables (email no es editable).\n"
					+ "- Los campos de negocio (openingDays, attentionSchedule, exceptionalClosingDays) son opcionales.\n"
					+ "- Las imágenes se cargan vía partes multipart: `avatar` (una) y `files` (múltiples).")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "User profile updated successfully",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = UserResumeResponseDTO.class))),
			@ApiResponse(responseCode = "404", description = "User not found",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = ErrorDTO.class))) })
	public ResponseEntity<?> updateProfileMultipart(@AuthenticationPrincipal UserDetails userDetails,
			@RequestPart("data") String data, @RequestPart(value = "avatar", required = false) MultipartFile avatar,
			@RequestPart(value = "files", required = false) List<MultipartFile> files) {
		try {
			UserUpdateRequestDTO dto = mapper.readValue(data, UserUpdateRequestDTO.class);
			return ResponseEntity.ok(userService.updateUser(userDetails.getUsername(), dto, files, avatar));
		}
		catch (Exception e) {
			throw new BadRequestException("Error al parsear el JSON: " + e.getMessage());
		}
	}

	@GetMapping("/search")
	@Operation(summary = "Obtains users that meet the filters",
			description = "Filters are received as query params via model attributes.\n\n"
				+ "Parameters:\n"
				+ "- role: User role to filter.\n"
				+ "- location: Partial match (case-insensitive).\n"
				+ "- businessType: Business category.\n"
				+ "- page, size, sort: Pagination (e.g., sort=name,asc).")
	@ApiResponses(value = { @ApiResponse(responseCode = "200", description = "User obtained successfully",
			content = { @Content(mediaType = "application/json",
					schema = @Schema(implementation = UserResumeResponseDTO.class)) }) })
	public ResponseEntity<?> search(@ParameterObject @ModelAttribute UserSearchRequestDTO userSearchRequestDTO,
			@ParameterObject @PageableDefault Pageable pageable) {
		return ResponseEntity.ok().body(userService.search(userSearchRequestDTO, pageable));
	}

}
