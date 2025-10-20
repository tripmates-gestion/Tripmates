package com.tripmates.backend.users.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.tripmates.backend.users.dto.UserCreationRequestDTO;
import com.tripmates.backend.users.dto.UserProfileResponseDTO;
import com.tripmates.backend.users.dto.DescriptionUpdateRequestDTO;
import com.tripmates.backend.users.dto.UsernameUpdateRequestDTO;
import com.tripmates.backend.users.service.UserService;

import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/users")
@Tag(name = "Users", description = "User management endpoints")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Endpoint para crear un usuario en el sistema.
     *
     * @param userCreationRequestDTO dto para parseo y validación de JSON.
     * @return los tokens generados (access y refresh).
     */
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody UserCreationRequestDTO userCreationRequestDTO) {
        return ResponseEntity.ok(this.userService.createUser(userCreationRequestDTO));
    }

    /**
     * Endpoint para obtener el perfil del usuario autenticado.
     *
     * @param userDetails información del usuario obtenida desde el contexto de seguridad (JWT).
     * @return el perfil del usuario.
     */
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponseDTO> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        var profile = userService.getProfile(userDetails.getUsername());
        return ResponseEntity.ok(profile);
    }
    
    @PatchMapping("/me/description")
    public ResponseEntity<UserProfileResponseDTO> updateDescription(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody DescriptionUpdateRequestDTO dto) {
        return ResponseEntity.ok(userService.updateDescription(userDetails.getUsername(), dto));
    }
    @PatchMapping("/me/username")
    public ResponseEntity<UserProfileResponseDTO> updateUsername(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UsernameUpdateRequestDTO dto) {
        return ResponseEntity.ok(userService.updateUsername(userDetails.getUsername(), dto));
    }
}

