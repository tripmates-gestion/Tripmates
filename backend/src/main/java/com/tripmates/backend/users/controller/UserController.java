package com.tripmates.backend.users.controller;

import com.tripmates.backend.config.security.jwt.UserDetailFromJwt;
import com.tripmates.backend.users.entity.mongo.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.tripmates.backend.users.dto.UserUpdateProfileResponseDTO;
import com.tripmates.backend.users.dto.UserUpdateDescriptionRequestDTO;
import com.tripmates.backend.users.dto.UserUpdateUsernameRequestDTO;
import com.tripmates.backend.users.service.UserService;

import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "Users", description = "User management endpoints")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "Obtains a user from the system")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User obtained successfully",
                    content = { @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = User.class))
                    }
            ),
            @ApiResponse(responseCode = "404", description = "User not found",
                    content = { @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = void.class))
                    }
            )
    })
    @GetMapping("/me")
    public ResponseEntity<?> getUser(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getUser(userDetails.getUsername()));
    }

    @Operation(summary = "Updates profile description from a user in the system")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Profile description updated successfully",
                    content = { @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = UserUpdateProfileResponseDTO.class))
                    }
            ),
            @ApiResponse(responseCode = "404", description = "User not found",
                    content = { @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = void.class))
                    }
            )
    })
    @PatchMapping("/me/description")
    public ResponseEntity<?> updateDescription(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UserUpdateDescriptionRequestDTO userUpdateDescriptionRequestDTO
    ) {
        return ResponseEntity.ok(userService.updateDescription(
                userDetails.getUsername(),
                userUpdateDescriptionRequestDTO
        ));
    }

    @Operation(summary = "Updates profile username from a user in the system")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Profile username updated successfully",
                    content = { @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = UserUpdateProfileResponseDTO.class))
                    }
            ),
            @ApiResponse(responseCode = "404", description = "User not found",
                    content = { @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = void.class))
                    }
            )
    })
    @PatchMapping("/me/username")
    public ResponseEntity<?> updateUsername(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UserUpdateUsernameRequestDTO userUpdateUsernameRequestDTO
    ) {
        return ResponseEntity.ok(userService.updateUsername(
                userDetails.getUsername(),
                userUpdateUsernameRequestDTO
        ));
    }
}
