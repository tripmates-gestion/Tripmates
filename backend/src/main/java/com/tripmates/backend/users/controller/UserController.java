package com.tripmates.backend.users.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tripmates.backend.users.entity.mongo.User;
import com.tripmates.backend.users.service.UserService;
import com.tripmates.backend.users.dto.UserCreationRequestDTO;

import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/users")
@Tag(name = "Users", description = "User management endpoints")
public class UserController {
    private UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public User createUser(@RequestBody UserCreationRequestDTO userCreationRequestDTO) {
        return userService.createUser(userCreationRequestDTO);
    }
}
