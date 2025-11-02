package com.tripmates.backend.publications.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import com.tripmates.backend.publications.service.PublicationService;
import com.tripmates.backend.publications.dto.BusinessPublicationResponseDTO;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpStatus;
import com.tripmates.backend.publications.dto.BusinessPublicationRequestDTO;
import com.tripmates.backend.publications.dto.PublicationSearchRequestDTO;
import com.tripmates.backend.publications.dto.ReviewCreationRequestDTO;
import com.tripmates.backend.publications.dto.ReviewResponseDTO;

import java.util.List;

import com.tripmates.backend.common.constants.DocumentationObjectsExamples;
import com.tripmates.backend.common.service.parsing.ObjectParsingService;
import org.springframework.beans.factory.annotation.Autowired;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springdoc.core.annotations.ParameterObject;

@RestController
@RequestMapping("/publications")
@Tag(name = "Publications", description = "Publication management endpoints (services, hostings, etc.)")
public class PublicationController {

	@Autowired
	private PublicationService publicationService;

	@Autowired
	private ObjectParsingService parsingService;

	@PostMapping(value = "/business", consumes = "multipart/form-data")
	@Operation(summary = "Create a new business publication",
			description = DocumentationObjectsExamples.BUSINESS_PUBLICATION_EXAMPLE)
	public ResponseEntity<?> uploadBusinessPublication(@Parameter(
			description = "JSON string containing the business publication data. Required fields: title (non-empty), description (non-empty), the rest are optional.") @RequestPart("data") String data,
			@Parameter(
					description = "Optional image files for the publication. Supported formats: JPG, PNG, etc.") @RequestPart(
							value = "files", required = false) List<MultipartFile> files,
			@AuthenticationPrincipal UserDetails userDetails) {
		BusinessPublicationRequestDTO publication = parsingService.parseAndValidate(data,
				BusinessPublicationRequestDTO.class);
		return ResponseEntity.ok()
			.body(publicationService.createBusinessPublication(publication, files, userDetails.getUsername()));
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

	@GetMapping("/mine")
	@Operation(summary = "List my publications",
			description = "Returns all publications owned by the authenticated user.")
	@ApiResponses(value = { @ApiResponse(responseCode = "200", description = "Publications fetched successfully") })
	public ResponseEntity<?> listMyPublications(@AuthenticationPrincipal UserDetails userDetails) {
		return ResponseEntity.ok(publicationService.listMyPublications(userDetails.getUsername()));
	}

	@PatchMapping(value = "/{id}", consumes = "multipart/form-data")
	@Operation(summary = "Update a publication",
			description = "Updates an existing publication with JSON data and optional images.\n\n"
					+ "Multipart request structure:\n" + "- `data`: (required) JSON with the fields to update.\n"
					+ "- `files`: (optional) Images for the publication (JPG, PNG, etc.).\n\n"
					+ "Example JSON for the `data` part:\n" + "```json\n" + "{\n" + "  \"title\": \"New title\",\n"
					+ "  \"description\": \"Updated description\",\n" + "  \"phoneNumber\": \"+541112345678\",\n"
					+ "  \"email\": \"contact@hostel.com\",\n" + "  \"location\": \"123 Address, City\",\n"
					+ "  \"openingDays\": [\"MONDAY\", \"TUESDAY\"],\n"
					+ "  \"attentionSchedule\": { \"openingTime\": \"09:00\", \"closingTime\": \"18:00\" },\n"
					+ "  \"exceptionalClosingDays\": [\"2025-12-25\"]\n" + "}\n" + "```")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Publication updated successfully",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = BusinessPublicationResponseDTO.class))),
			@ApiResponse(responseCode = "400", description = "Invalid request") })
	public ResponseEntity<?> updateBusinessPublication(@PathVariable String id, @RequestPart("data") String data,
			@RequestPart(value = "files", required = false) List<MultipartFile> files,
			@AuthenticationPrincipal UserDetails userDetails) {
		BusinessPublicationRequestDTO dto = parsingService.parseAndValidate(data, BusinessPublicationRequestDTO.class);
		return ResponseEntity.ok()
			.body(publicationService.updatePublication(id, dto, files, userDetails.getUsername()));
	}

	@GetMapping("/{id}")
	@Operation(summary = "Get my publication",
			description = "Obtains a publication by id, only if it belongs to the authenticated user.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Publication obtained successfully",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = BusinessPublicationResponseDTO.class))),
			@ApiResponse(responseCode = "400",
					description = "Publication does not exist or does not belong to the user") })
	public ResponseEntity<?> getMyPublication(@PathVariable String id,
			@AuthenticationPrincipal UserDetails userDetails) {
		return ResponseEntity.ok(publicationService.getMyPublication(id, userDetails.getUsername()));
	}

	@DeleteMapping("/{id}")
	@Operation(summary = "Delete my publication",
			description = "Deletes a publication by id, only if it belongs to the authenticated user.")
	@ApiResponses(value = { @ApiResponse(responseCode = "204", description = "Publication deleted successfully"),
			@ApiResponse(responseCode = "400", description = "Not found or not owned by user") })
	public ResponseEntity<Void> deleteMyPublication(@PathVariable String id,
			@AuthenticationPrincipal UserDetails userDetails) {
		publicationService.deletePublication(id, userDetails.getUsername());
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/search")
	@Operation(summary = "Obtains publications that meet the filters",
			description = "Filters are received as query params via model attributes.\n\n" + "Parameters:\n"
					+ "- q: Full-text search across title and description (case-insensitive).\n"
					+ "- location: Partial match (case-insensitive).\n"
					+ "- tags: Publication must contain all provided tags.\n" + "- ownerId: Filter by owner id.\n"
					+ "- page, size, sort: Pagination (e.g., sort=createdAt,desc).")
	@ApiResponses(value = { @ApiResponse(responseCode = "200", description = "Publications obtained successfully",
			content = { @Content(mediaType = "application/json",
					schema = @Schema(implementation = BusinessPublicationResponseDTO.class)) }) })
	public ResponseEntity<?> search(
			@ParameterObject @ModelAttribute PublicationSearchRequestDTO publicationSearchRequestDTO,
			@ParameterObject @PageableDefault Pageable pageable) {
		return ResponseEntity.ok().body(publicationService.search(publicationSearchRequestDTO, pageable));
	}

}
