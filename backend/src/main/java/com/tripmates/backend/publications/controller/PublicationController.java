package com.tripmates.backend.publications.controller;

import com.tripmates.backend.common.dto.ErrorDTO;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springdoc.core.annotations.ParameterObject;

import com.tripmates.backend.publications.service.PublicationService;
import com.tripmates.backend.publications.dto.PublicationResumeResponseDTO;
import com.tripmates.backend.publications.dto.BusinessPublicationRequestDTO;
import com.tripmates.backend.publications.dto.PublicationSearchRequestDTO;
import com.tripmates.backend.common.constants.DocumentationObjectsExamples;
import com.tripmates.backend.common.service.parsing.ObjectParsingService;

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
			.body(publicationService.create(parsingService.parseAndValidate(data, BusinessPublicationRequestDTO.class),
					files, userDetails.getUsername()));
	}
	@PatchMapping(value = "/{id}", consumes = "multipart/form-data")
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
	public ResponseEntity<?> update(@PathVariable String id, @RequestPart("data") String data,
                                    @RequestPart(value = "files", required = false) List<MultipartFile> files,
                                    @AuthenticationPrincipal UserDetails userDetails) {
		return ResponseEntity.ok()
			.body(publicationService.update(id,
					parsingService.parseAndValidate(data, BusinessPublicationRequestDTO.class), files,
					userDetails.getUsername()));
	}

	@DeleteMapping("/{id}")
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
	public ResponseEntity<Void> delete(@PathVariable String id,
                                       @AuthenticationPrincipal UserDetails userDetails) {
		publicationService.delete(id, userDetails.getUsername());
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
		return ResponseEntity.ok().body(publicationService.search(publicationSearchRequestDTO, pageable));
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
        return ResponseEntity.ok(publicationService.getAuthenticated(userDetails.getUsername()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtains a publication by user's ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Publication obtained successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = PublicationResumeResponseDTO.class))),
            @ApiResponse(responseCode = "404", description = "User not found",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorDTO.class))) })
    public ResponseEntity<?> getUnauthorized(@PathVariable String id) {
        return ResponseEntity.ok(publicationService.getNoneAuthenticated(id));
    }

}
