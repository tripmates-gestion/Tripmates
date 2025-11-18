package com.tripmates.backend.community.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;

import com.tripmates.backend.community.service.CommunityService;
import com.tripmates.backend.publications.dto.ReviewsListDTO;
import com.tripmates.backend.common.dto.ErrorDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/community")
@Tag(name = "Community", description = "Community management endpoints")
public class CommunityController {
  private final CommunityService communityService;

  public CommunityController(CommunityService communityService) {
    this.communityService = communityService;
  }

  
  @PostMapping("/{planId}/{userId}/invite-user")
  @Operation(
      summary = "Invite a user to a plan",
      description = """
      Invita a un usuario (rol USER) a un plan del que el usuario autenticado es owner.
      - Solo el dueño del plan puede invitar.
      - Solo cuentas con rol USER pueden ser invitadas.
      - Falla si el usuario ya es colaborador o ya está invitado.
      """
  )
  @ApiResponses(value = {
      @ApiResponse(
          responseCode = "204",
          description = "Invitation processed successfully (invited or reinvited)",
          content = @Content(mediaType = "application/json",
              schema = @Schema(implementation = void.class))
      ),
      @ApiResponse(
          responseCode = "400",
          description = "Validation error or bad request",
          content = @Content(mediaType = "application/json",
              schema = @Schema(implementation = ErrorDTO.class))
      ),
      @ApiResponse(
          responseCode = "404",
          description = "User or plan not found",
          content = @Content(mediaType = "application/json",
              schema = @Schema(implementation = ErrorDTO.class))
      ),
      @ApiResponse(
          responseCode = "401",
          description = "Unauthorized: invalid credentials, user not authenticated, not plan owner, not USER role, already in plan or already invited",
          content = @Content(mediaType = "application/json",
              schema = @Schema(implementation = ErrorDTO.class))
      )
  })
  public ResponseEntity<?> inviteUserToPlan(
      @PathVariable("planId") String planId,
      @PathVariable("userId") String userId,
      @AuthenticationPrincipal UserDetails userDetails
  ) {
    communityService.inviteUserToPlan(planId, userId, userDetails.getUsername());
    return ResponseEntity.noContent().build();
  }
}
