package com.tripmates.backend.auth.controller;

import com.tripmates.backend.auth.dto.AuthLoginRequestDTO;
import com.tripmates.backend.auth.dto.AuthLogoutRequestDTO;
import com.tripmates.backend.auth.dto.AuthRefreshRequestDTO;
import com.tripmates.backend.auth.service.AuthService;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("auth/")
@Tag(name = "Auth", description = "Auth management endpoints")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) { this.authService = authService; }

    /**
     * Endpoint para login de usuario
     *
     * @param authLoginRequestDTO contiene email y password
     * @return {@link com.tripmates.backend.auth.dto.AuthLoginResponseDTO AuthLoginResponseDTO}
     */
    @PostMapping("/login")
    @ApiResponse(description = "Returns refresh and access token")
    public ResponseEntity<?> login(@RequestBody AuthLoginRequestDTO authLoginRequestDTO) {
        return ResponseEntity.ok(authService.login(authLoginRequestDTO));
    }

    /**
     * Endpoint para logout de usuario
     *
     * @param authLogoutRequestDTO contiene email
     * @return {@link com.tripmates.backend.auth.dto.AuthLogoutResponseDTO AuthLogoutResponseDTO}
     */
    @PostMapping("/logout")
    @ApiResponse(description = "Returns nothing")
    public ResponseEntity<?> logout(@RequestBody AuthLogoutRequestDTO authLogoutRequestDTO) {
        return ResponseEntity.ok(authService.logout(authLogoutRequestDTO));
    }

    /**
     * Endpoint para refresh de access token
     *
     * @param authRefreshRequestDTO contiene email y refresh token
     * @return {@link com.tripmates.backend.auth.dto.AuthRefreshResponseDTO AuthRefreshResponseDTO}
     */
    @PostMapping("/refresh")
    @ApiResponse(description = "Returns access token")
    public ResponseEntity<?> refresh(AuthRefreshRequestDTO authRefreshRequestDTO) {
        return ResponseEntity.ok(authService.refresh(authRefreshRequestDTO));
    }
}
