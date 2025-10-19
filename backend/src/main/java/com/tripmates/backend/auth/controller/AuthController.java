package com.tripmates.backend.auth.controller;

import com.tripmates.backend.auth.dto.AuthLoginRequestDTO;
import com.tripmates.backend.auth.service.AuthService;
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
     * Endpoint para inicio de sesión.
     *
     * @param authLoginRequestDTO contiene email y password.
     * @return access token y refresh token, {@link com.tripmates.backend.auth.dto.AuthLoginResponseDTO AuthLoginResponseDTO}.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthLoginRequestDTO authLoginRequestDTO) {
        return ResponseEntity.ok(this.authService.login(authLoginRequestDTO));
    }

}
