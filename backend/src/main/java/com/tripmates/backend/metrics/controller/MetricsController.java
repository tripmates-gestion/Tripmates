package com.tripmates.backend.metrics.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.beans.factory.annotation.Autowired;

import com.tripmates.backend.metrics.service.MetricsService;
import com.tripmates.backend.metrics.dto.GetMetricsResponseDTO;
import com.tripmates.backend.common.types.EventReport;
import com.tripmates.backend.common.dto.ErrorDTO;

@RestController
@RequestMapping("/metrics")
@Tag(name = "Metrics", description = "Metrics management endpoints")
public class MetricsController {

  private final MetricsService metricsService;

  public MetricsController(MetricsService metricsService) {
    this.metricsService = metricsService;
  }
  // @GetMapping("/mine")
  // public ResponseEntity<GetMetricsResponseDTO> getMetrics() {
  //     return ResponseEntity.ok(metricsService.getMetrics());
  // }

  //cuantos usuarios realizaron reseñas de cada una de sus publicaciones
  // @GetMapping("/reviews")
  // @Operation(summary = "Get reviews event report")
  // @ApiResponses(value = {
  //     @ApiResponse(responseCode = "200", description = "Reviews event report retrieved successfully", 
  //         content = { @Content(mediaType = "application/json", 
  //         schema = @Schema(implementation = EventReport.class)) }),
  //     @ApiResponse(responseCode = "404", description = "User not found", 
  //         content = { @Content(mediaType = "application/json", 
  //         schema = @Schema(implementation = ErrorDTO.class)) }) 
  // })
  // public ResponseEntity<?> getReviewsEventReport(
  //     @AuthenticationPrincipal UserDetails userDetails,
  //     @RequestParam(required = false, defaultValue = "7") Integer daysAgo) {
  //     return ResponseEntity.ok(metricsService.getReviewsEventReport(userDetails.getUsername(), daysAgo));
  // }
  
  @GetMapping("/profile-views")
  @Operation(summary = "Get profile views event report")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Profile views event report retrieved successfully", 
          content = { @Content(mediaType = "application/json", 
          schema = @Schema(implementation = EventReport.class)) }),
      @ApiResponse(responseCode = "404", description = "User not found", 
          content = { @Content(mediaType = "application/json", 
          schema = @Schema(implementation = ErrorDTO.class)) }) 
  })
  public ResponseEntity<?> getProfileViewsEventReport(
      @AuthenticationPrincipal UserDetails userDetails,
      @RequestParam(required = false, defaultValue = "7") Integer daysAgo) {
      return ResponseEntity.ok(metricsService.getProfileViewsEventReport(userDetails.getUsername(), daysAgo));
  }

  @Operation(summary = "Registers a profile view")
  @ApiResponses(value = {
    @ApiResponse(responseCode = "204", description = "Profile view registered successfully", content = { @Content(mediaType = "application/json", schema = @Schema(implementation = void.class)) }),
    @ApiResponse(responseCode = "404", description = "User not found", content = { @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorDTO.class)) }) })
  @PostMapping("/view-profile")
  public ResponseEntity<?> registerProfileView(@AuthenticationPrincipal UserDetails userDetails,String profileSeenEmail) {
      metricsService.registerProfileView(
        userDetails.getUsername(),
        profileSeenEmail
        );
      return ResponseEntity.noContent().build();
  }

}
