package com.tripmates.backend.users.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tripmates.backend.users.service.UserService;
import com.tripmates.backend.users.dto.UserCreationRequestDTO;

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
     * @return el usuario creado.
     */
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody UserCreationRequestDTO userCreationRequestDTO) {
        return ResponseEntity.ok(this.userService.createUser(userCreationRequestDTO));
    }
}
