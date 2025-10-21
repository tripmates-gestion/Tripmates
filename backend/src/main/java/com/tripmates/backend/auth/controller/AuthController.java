package com.tripmates.backend.auth.controller;

import com.tripmates.backend.auth.dto.AuthLoginRequestDTO;
import com.tripmates.backend.auth.dto.AuthLogoutRequestDTO;
import com.tripmates.backend.auth.dto.AuthRefreshRequestDTO;
import com.tripmates.backend.auth.exception.UserAlreadyExistingException;
import com.tripmates.backend.auth.service.AuthService;
import com.tripmates.backend.config.security.jwt.UserDetailFromJwt;
import com.tripmates.backend.users.dto.UserCreationRequestDTO;
import com.tripmates.backend.users.dto.UserCreationResponseDTO;
import com.tripmates.backend.users.entity.mongo.User;

import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173") // Allow requests
@Tag(name = "Auth", description = "Auth management endpoints")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Endpoint para crear un usuario en el sistema.
     *
     * @param userCreationRequestDTO dto para parseo y validación de JSON.
     * @return los tokens generados (access y refresh).
     */
    @PostMapping("/register")
    public ResponseEntity<?> createUser(@RequestBody UserCreationRequestDTO userCreationRequestDTO) {
        this.authService.createUser(userCreationRequestDTO);
        return ResponseEntity.ok().build();
    }

    /**
     * Endpoint para login de usuario
     *
     * @param authLoginRequestDTO contiene email y password
     * @return {@link com.tripmates.backend.auth.dto.AuthLoginResponseDTO
     *         AuthLoginResponseDTO}
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
     * @return {@link com.tripmates.backend.auth.dto.AuthLogoutResponseDTO
     *         AuthLogoutResponseDTO}
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
     * @return {@link com.tripmates.backend.auth.dto.AuthRefreshResponseDTO
     *         AuthRefreshResponseDTO}
     */
    @PostMapping("/refresh")
    @ApiResponse(description = "Returns access token")
    public ResponseEntity<?> refresh(@RequestBody AuthRefreshRequestDTO authRefreshRequestDTO) {
        return ResponseEntity.ok(authService.refresh(authRefreshRequestDTO));
    }
}
