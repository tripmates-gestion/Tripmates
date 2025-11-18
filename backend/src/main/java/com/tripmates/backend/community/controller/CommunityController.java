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
      description = "Invita a un usuario (rol USER) a un plan del que el usuario autenticado es owner."
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

  @PostMapping("/{planId}/accept-invitation")
  @Operation(summary = "Accept an invitation to a plan",
      description = "Solo el usuario invitado puede aceptar la invitación; el servicio mueve el ID de pending a colaboradores.")
  @ApiResponses(value = {
      @ApiResponse(
          responseCode = "204",
          description = "Invitation accepted",
          content = @Content(mediaType = "application/json",
              schema = @Schema(implementation = void.class))
      ),
      @ApiResponse(
          responseCode = "400",
          description = "Validation error / bad request",
          content = @Content(mediaType = "application/json",
              schema = @Schema(implementation = ErrorDTO.class))
      ),
      @ApiResponse(
          responseCode = "401",
          description = "Unauthorized: token invalid, role not USER, or not the invited user",
          content = @Content(mediaType = "application/json",
              schema = @Schema(implementation = ErrorDTO.class))
      ),
      @ApiResponse(
          responseCode = "404",
          description = "Plan not found",
          content = @Content(mediaType = "application/json",
              schema = @Schema(implementation = ErrorDTO.class))
      )
  })
  public ResponseEntity<?> acceptInvitation(
      @PathVariable("planId") String planId,
      @AuthenticationPrincipal UserDetails userDetails
  ) {
    communityService.acceptInvitation(planId, userDetails.getUsername());
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/{planId}/decline-invitation")
  @Operation(summary = "Decline an invitation to a plan",
      description = "Permite al usuario invitado remover su ID del listado de pendientes sin convertirse en colaborador.")
  @ApiResponses(value = {
      @ApiResponse(
          responseCode = "204",
          description = "Invitation declined",
          content = @Content(mediaType = "application/json",
              schema = @Schema(implementation = void.class))
      ),
      @ApiResponse(
          responseCode = "400",
          description = "Validation error / bad request",
          content = @Content(mediaType = "application/json",
              schema = @Schema(implementation = ErrorDTO.class))
      ),
      @ApiResponse(
          responseCode = "401",
          description = "Unauthorized: token invalid, role not USER, or not the invited user",
          content = @Content(mediaType = "application/json",
              schema = @Schema(implementation = ErrorDTO.class))
      ),
      @ApiResponse(
          responseCode = "404",
          description = "Plan not found",
          content = @Content(mediaType = "application/json",
              schema = @Schema(implementation = ErrorDTO.class))
      )
  })
  public ResponseEntity<?> declineInvitation(
      @PathVariable("planId") String planId,
      @AuthenticationPrincipal UserDetails userDetails
  ) {
    communityService.declineInvitation(planId, userDetails.getUsername());
    return ResponseEntity.noContent().build();
  }

}
