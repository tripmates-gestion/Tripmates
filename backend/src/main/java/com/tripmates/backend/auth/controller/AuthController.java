package com.tripmates.backend.auth.controller;

import com.tripmates.backend.auth.dto.*;
import com.tripmates.backend.auth.service.AuthService;
import com.tripmates.backend.common.dto.ErrorDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
@Tag(name = "Auth", description = "Authorization management endpoints")
public class AuthController {

	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	@PostMapping("/register")
	@Operation(summary = "Registers a new user in the system")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "204", description = "User created successfully", content = { @Content() }),
			@ApiResponse(responseCode = "400", description = "User already exists", content = {
					@Content(mediaType = "application/json", schema = @Schema(implementation = ErrorDTO.class)) }) })
	public ResponseEntity<?> register(@RequestBody @Valid AuthRegisterRequestDTO authRegisterRequestDTO) {
		authService.register(authRegisterRequestDTO);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/login")
	@Operation(summary = "Logins an already existing user in the system")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "User logins successfully",
					content = { @Content(mediaType = "application/json",
							schema = @Schema(implementation = AuthLoginResponseDTO.class)) }),
			@ApiResponse(responseCode = "404", description = "User not found",
					content = { @Content(mediaType = "application/json",
							schema = @Schema(implementation = ErrorDTO.class)) }),
			@ApiResponse(responseCode = "401", description = "Invalid credentials", content = {
					@Content(mediaType = "application/json", schema = @Schema(implementation = ErrorDTO.class)) }) })
	public ResponseEntity<?> login(@RequestBody AuthLoginRequestDTO authLoginRequestDTO) {
		return ResponseEntity.ok(authService.login(authLoginRequestDTO));
	}

	@PostMapping("/logout")
	@Operation(summary = "Logout user from the system")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "204", description = "User logouts successfully",
					content = {
							@Content(mediaType = "application/json", schema = @Schema(implementation = void.class)) }),
			@ApiResponse(responseCode = "404", description = "User not found", content = {
					@Content(mediaType = "application/json", schema = @Schema(implementation = ErrorDTO.class)) }) })
	public ResponseEntity<?> logout(@RequestBody AuthLogoutRequestDTO authLogoutRequestDTO) {
		authService.logout(authLogoutRequestDTO);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/refresh")
	@Operation(summary = "Refresh access token from user")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Refresh access token done successfully",
					content = { @Content(mediaType = "application/json",
							schema = @Schema(implementation = AuthRefreshResponseDTO.class)) }),
			@ApiResponse(responseCode = "404", description = "User not found",
					content = { @Content(mediaType = "application/json",
							schema = @Schema(implementation = ErrorDTO.class)) }),
			@ApiResponse(responseCode = "401", description = "Invalid credentials", content = {
					@Content(mediaType = "application/json", schema = @Schema(implementation = ErrorDTO.class)) }) })
	public ResponseEntity<?> refresh(@RequestBody AuthRefreshRequestDTO authRefreshRequestDTO) {
		return ResponseEntity.ok(authService.refresh(authRefreshRequestDTO));
	}

	@PostMapping("/request-password-reset")
	@Operation(summary = "Request a password reset code")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "204", description = "Password reset code sent successfully",
					content = { @Content() }),
			@ApiResponse(responseCode = "400", description = "User not found", content = {
					@Content(mediaType = "application/json", schema = @Schema(implementation = ErrorDTO.class)) }) })
	public ResponseEntity<?> requestPasswordReset(
			@RequestBody @Valid RequestPasswordResetDTO requestPasswordResetDTO) {
		authService.requestPasswordReset(requestPasswordResetDTO);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/verify-reset-code")
	@Operation(summary = "Verify a password reset code")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "204", description = "Code verified successfully", content = { @Content() }),
			@ApiResponse(responseCode = "400", description = "Invalid or expired code", content = {
					@Content(mediaType = "application/json", schema = @Schema(implementation = ErrorDTO.class)) }) })
	public ResponseEntity<?> verifyResetCode(@RequestBody @Valid VerifyResetCodeDTO verifyResetCodeDTO) {
		authService.verifyResetCode(verifyResetCodeDTO);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/reset-password")
	@Operation(summary = "Reset password using verification code")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "204", description = "Password reset successfully", content = { @Content() }),
			@ApiResponse(responseCode = "400", description = "Invalid or expired code",
					content = { @Content(mediaType = "application/json",
							schema = @Schema(implementation = ErrorDTO.class)) }),
			@ApiResponse(responseCode = "404", description = "User not found", content = {
					@Content(mediaType = "application/json", schema = @Schema(implementation = ErrorDTO.class)) }) })
	public ResponseEntity<?> resetPassword(@RequestBody @Valid ResetPasswordDTO resetPasswordDTO) {
		authService.resetPassword(resetPasswordDTO);
		return ResponseEntity.noContent().build();
	}

}
