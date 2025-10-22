package com.tripmates.backend.users.controller;

import com.tripmates.backend.users.dto.UserUpdateResponseDTO;
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
                            schema = @Schema(implementation = void.class))
                    }
            )
    })
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok().body(userService.getUser(userDetails.getUsername()));
    }
  
    @PatchMapping("/me/description")
    @Operation(summary = "Updates profile description from a user in the system")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Profile description updated successfully",
                    content = { @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = UserUpdateResponseDTO.class))
                    }
            ),
            @ApiResponse(responseCode = "404", description = "User not found",
                    content = { @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = void.class))
                    }
            )
    })
    public ResponseEntity<?> updateDescription(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UserUpdateDescriptionRequestDTO userUpdateDescriptionRequestDTO
    ) {
        return ResponseEntity.ok().body(
                userService.updateDescription(userDetails.getUsername(), userUpdateDescriptionRequestDTO)
        );
    }

    @PatchMapping("/me/username")
    @Operation(summary = "Updates profile username from a user in the system")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Profile username updated successfully",
                    content = { @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = UserUpdateResponseDTO.class))
                    }
            ),
            @ApiResponse(responseCode = "404", description = "User not found",
                    content = { @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = void.class))
                    }
            )
    })
    public ResponseEntity<?> updateUsername(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UserUpdateUsernameRequestDTO userUpdateDescriptionRequestDTO
    ) {
        return ResponseEntity.ok().body(
                userService.updateUsername(userDetails.getUsername(), userUpdateDescriptionRequestDTO)
        );
    }
}
