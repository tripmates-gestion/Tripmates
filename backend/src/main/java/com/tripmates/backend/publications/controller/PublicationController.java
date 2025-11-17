package com.tripmates.backend.publications.controller;

import com.tripmates.backend.common.dto.ErrorDTO;
import com.tripmates.backend.publications.dto.*;
import com.tripmates.backend.publications.service.PublicationService;
import com.tripmates.backend.common.constants.DocumentationObjectsExamples;
import com.tripmates.backend.common.service.parsing.ObjectParsingService;

import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springdoc.core.annotations.ParameterObject;

import java.util.List;

@RestController
@RequestMapping("/publications")
@Tag(name = "Publications", description = "Publication management endpoints")
public class PublicationController {

	@Autowired
	private PublicationService publicationService;

	@Autowired
	private ObjectParsingService parsingService;

	@PostMapping(value = "/business", consumes = "multipart/form-data")
	@Operation(summary = "Creates a publication for a specific business",
			description = DocumentationObjectsExamples.BUSINESS_PUBLICATION_EXAMPLE)
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Publication created successfully",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = PublicationResumeResponseDTO.class))),
			@ApiResponse(responseCode = "404", description = "User not found",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = ErrorDTO.class))) })
	public ResponseEntity<?> upload(@Parameter(
			description = "JSON string that contains the business publication data. Required fields: title (non-empty), description (non-empty), the rest are optional.") @RequestPart("data") String data,
			@Parameter(
					description = "Optional image files for the publication. Supported formats: JPG, PNG, etc.") @RequestPart(
							value = "files", required = false) List<MultipartFile> files,
			@AuthenticationPrincipal UserDetails userDetails) {
		return ResponseEntity.ok()
			.body(publicationService.createPublication(
					parsingService.parseAndValidate(data, PublicationRequestDTO.class), files,
					userDetails.getUsername()));
	}

	@PostMapping(value = "/{publicationId}/review", consumes = "multipart/form-data")
	@Operation(summary = "Create a new review", description = DocumentationObjectsExamples.CREATE_REVIEW_EXAMPLE)
	@ApiResponses(value = { @ApiResponse(responseCode = "201", description = "Review created successfully",
			content = @Content(mediaType = "application/json",
					schema = @Schema(implementation = ReviewResponseDTO.class))) })
	public ResponseEntity<?> createReview(@RequestPart("data") String data,
			@RequestPart(value = "files", required = false) List<MultipartFile> files,
			@PathVariable String publicationId, @AuthenticationPrincipal UserDetails userDetails) {
		ReviewCreationRequestDTO review = parsingService.parseAndValidate(data, ReviewCreationRequestDTO.class);
		return ResponseEntity.status(HttpStatus.CREATED)
			.body(publicationService.createReview(review, files, publicationId, userDetails.getUsername()));
	}

	@GetMapping(value = "/{publicationId}/review")
	@Operation(summary = "Get publication's reviews")
	@ApiResponses(value = { @ApiResponse(responseCode = "200", description = "Get publication's reviews successfully",
			content = @Content(mediaType = "application/json",
					schema = @Schema(implementation = ReviewsListDTO.class))) })
	public ResponseEntity<?> getReviews(@PathVariable String publicationId) {
		return ResponseEntity.ok(publicationService.getReviewsFromPublication(publicationId));
	}

	@GetMapping(value = "/users/{userId}/reviews", produces = MediaType.APPLICATION_JSON_VALUE)
	@Operation(summary = "Obtains all reviews from the given user")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Reviews obtained successfully",
					content = { @Content(mediaType = "application/json",
							schema = @Schema(implementation = ReviewsListDTO.class)) }),

			@ApiResponse(responseCode = "404", description = "User not found", content = {
					@Content(mediaType = "application/json", schema = @Schema(implementation = ErrorDTO.class)) }) })
	public ResponseEntity<?> getProfile(@PathVariable String userId) {
		return ResponseEntity.ok().body(publicationService.getReviewsFromUser(userId));
	}

	@PatchMapping(value = "/{publicationId}", consumes = "multipart/form-data")
	@Operation(summary = "Update a publication",
			description = DocumentationObjectsExamples.BUSINESS_PUBLICATION_UPDATE_EXAMPLE)
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Publication updated successfully",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = PublicationResumeResponseDTO.class))),
			@ApiResponse(responseCode = "404", description = "Publication not found",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = ErrorDTO.class))),
			@ApiResponse(responseCode = "404", description = "User not found",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = ErrorDTO.class))),
			@ApiResponse(responseCode = "401", description = "Invalid credentials",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = ErrorDTO.class))) })
	public ResponseEntity<?> update(@PathVariable String publicationId, @Parameter(
			description = "Optional JSON string containing updated non-image fields (title, description, phoneNumber, email, location, openingDays, attentionSchedule, exceptionalClosingDays) and deletePhotoIndexes to remove specific photos by 0-based indexes. If omitted, only photos will be modified.") @RequestPart("data") String data,
			@Parameter(
					description = "Optional image files to append to the publication photos. Supported formats: JPG, PNG, etc.") @RequestPart(
							value = "files", required = false) List<MultipartFile> files,
			@AuthenticationPrincipal UserDetails userDetails) {
		return ResponseEntity.ok()
			.body(publicationService.updatePublication(publicationId,
					parsingService.parseAndValidate(data, PublicationUpdateRequestDTO.class), files,
					userDetails.getUsername()));
	}

	@DeleteMapping("/{publicationId}")
	@Operation(summary = "Deletes user's publication")
	@ApiResponses(
			value = {
					@ApiResponse(responseCode = "204", description = "Publication deleted successfully",
							content = @Content(mediaType = "application/json",
									schema = @Schema(implementation = void.class))),
					@ApiResponse(responseCode = "404", description = "User not found",
							content = @Content(mediaType = "application/json",
									schema = @Schema(implementation = ErrorDTO.class))),
					@ApiResponse(responseCode = "401", description = "Invalid credentials",
							content = @Content(mediaType = "application/json",
									schema = @Schema(implementation = ErrorDTO.class))) })
	public ResponseEntity<Void> delete(@PathVariable String publicationId,
			@AuthenticationPrincipal UserDetails userDetails) {
		publicationService.deletePublication(publicationId, userDetails.getUsername());
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/search")
	@Operation(summary = "Obtains publications that meet the filters",
			description = DocumentationObjectsExamples.BUSINESS_PUBLICATION_SEARCH_EXAMPLE)
	@ApiResponses(value = { @ApiResponse(responseCode = "200", description = "Publications obtained successfully",
			content = { @Content(mediaType = "application/json",
					schema = @Schema(implementation = PublicationResumeResponseDTO.class)) }) })
	public ResponseEntity<?> search(
			@ParameterObject @ModelAttribute PublicationSearchRequestDTO publicationSearchRequestDTO,
			@ParameterObject @PageableDefault Pageable pageable) {
		return ResponseEntity.ok().body(publicationService.searchPublication(publicationSearchRequestDTO, pageable));
	}

	@GetMapping("/mine")
	@Operation(summary = "Gets user's publications")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Publication fetched successfully",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = PublicationResumeResponseDTO.class))),
			@ApiResponse(responseCode = "404", description = "Publication not found",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = ErrorDTO.class))) })
	public ResponseEntity<?> getAuthorized(@AuthenticationPrincipal UserDetails userDetails) {
		return ResponseEntity.ok(publicationService.getPublicationAuthenticated(userDetails.getUsername()));
	}

	@GetMapping("/{userId}")
	@Operation(summary = "Obtains a publication by user's ID")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Publication obtained successfully",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = PublicationResumeResponseDTO.class))),
			@ApiResponse(responseCode = "404", description = "User not found",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = ErrorDTO.class))) })
	public ResponseEntity<?> getUnauthorized(@PathVariable String userId) {
		return ResponseEntity.ok(publicationService.getPublicationNoneAuthenticated(userId));
	}

	@PostMapping("/{publicationId}/like")
	@Operation(summary = "Add a like to a publication", description = "Allows a user to like a publication")
	@ApiResponses(
			value = {
					@ApiResponse(responseCode = "204", description = "Like added successfully",
							content = @Content(mediaType = "application/json",
									schema = @Schema(implementation = void.class))),
					@ApiResponse(responseCode = "404", description = "Publication not found",
							content = @Content(mediaType = "application/json",
									schema = @Schema(implementation = ErrorDTO.class))) })
	public ResponseEntity<Void> addLike(@PathVariable String publicationId,
			@AuthenticationPrincipal UserDetails userDetails) {
		publicationService.addLike(publicationId, userDetails.getUsername());
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/{publicationId}/unlike")
	@Operation(summary = "Remove a like from a publication",
			description = "Allows a user to remove their like from a publication")
	@ApiResponses(
			value = {
					@ApiResponse(responseCode = "204", description = "Like removed successfully",
							content = @Content(mediaType = "application/json",
									schema = @Schema(implementation = void.class))),
					@ApiResponse(responseCode = "404", description = "Publication not found",
							content = @Content(mediaType = "application/json",
									schema = @Schema(implementation = ErrorDTO.class))) })
	public ResponseEntity<Void> removeLike(@PathVariable String publicationId,
			@AuthenticationPrincipal UserDetails userDetails) {
		publicationService.removeLike(publicationId, userDetails.getUsername());
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/{publicationId}/likes")
	@Operation(summary = "Get list of users who liked a publication",
			description = "Returns a list of users who have liked the publication")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Likes list obtained successfully",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = LikesListDTO.class))),
			@ApiResponse(responseCode = "404", description = "Publication not found",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = ErrorDTO.class))) })
	public ResponseEntity<?> getLikesList(@PathVariable String publicationId) {
		return ResponseEntity.ok(publicationService.getLikesList(publicationId));
	}

}
