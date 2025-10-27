package com.tripmates.backend.auth.controller;

import com.tripmates.backend.auth.dto.*;
import com.tripmates.backend.auth.service.AuthService;
import com.tripmates.backend.common.dto.ErrorDTO;
import com.tripmates.backend.users.dto.UserCreationRequestDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
            @ApiResponse(responseCode = "200", description = "User created successfully",
                    content = { @Content()}
            ),
            @ApiResponse(responseCode = "400", description = "User already exists",
                    content = { @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ErrorDTO.class))
                    }
            )
    })
    public ResponseEntity<?> register(@RequestBody UserCreationRequestDTO userCreationRequestDTO) {
        authService.register(userCreationRequestDTO);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    @Operation(summary = "Logins an already existing user in the system")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User logins successfully",
                    content = { @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = AuthLoginResponseDTO.class))
                    }
            ),
            @ApiResponse(responseCode = "404", description = "User not found",
                    content = { @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ErrorDTO.class))
                    }
            ),
            @ApiResponse(responseCode = "401", description = "Invalid credentials",
                    content = { @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ErrorDTO.class))
                    }
            )
    })
    public ResponseEntity<?> login(@RequestBody AuthLoginRequestDTO authLoginRequestDTO) {
        return ResponseEntity.ok(authService.login(authLoginRequestDTO));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user from the system")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User logouts successfully",
                    content = { @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = void.class))
                    }
            ),
            @ApiResponse(responseCode = "404", description = "User not found",
                    content = { @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ErrorDTO.class))
                    }
            )
    })
    public ResponseEntity<?> logout(@RequestBody AuthLogoutRequestDTO authLogoutRequestDTO) {
        authService.logout(authLogoutRequestDTO);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token from user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Refresh access token done successfully",
                    content = { @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = AuthRefreshResponseDTO.class))
                    }
            ),
            @ApiResponse(responseCode = "404", description = "User not found",
                    content = { @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ErrorDTO.class))
                    }
            ),
            @ApiResponse(responseCode = "401", description = "Invalid credentials",
                    content = { @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ErrorDTO.class))
                    }
            )
    })
    public ResponseEntity<?> refresh(@RequestBody AuthRefreshRequestDTO authRefreshRequestDTO) {
        return ResponseEntity.ok(authService.refresh(authRefreshRequestDTO));
    }
}
