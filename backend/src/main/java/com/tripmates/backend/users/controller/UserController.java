package com.tripmates.backend.users.controller;

import com.tripmates.backend.users.dto.UserResumeResponseDTO;
import com.tripmates.backend.users.entity.mongo.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.tripmates.backend.common.dto.ErrorDTO;
import com.tripmates.backend.users.dto.UserUpdateRequestDTO;
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

    @GetMapping("/me")
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
                            schema = @Schema(implementation = ErrorDTO.class))
                    }
            )
    })
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok().body(userService.getUser(userDetails.getUsername()));
    }
  
    @PatchMapping("/me")
    @Operation(summary = "Updates user profile information in the system")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User profile updated successfully",
                    content = { @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = UserResumeResponseDTO.class))
                    }
            ),
            @ApiResponse(responseCode = "404", description = "User not found",
                    content = { @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ErrorDTO.class))
                    }
            )
    })
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UserUpdateRequestDTO userUpdateRequestDTO
    ) {
        return ResponseEntity.ok().body(
                userService.updateUser(userDetails.getUsername(), userUpdateRequestDTO)
        );
    }
}
