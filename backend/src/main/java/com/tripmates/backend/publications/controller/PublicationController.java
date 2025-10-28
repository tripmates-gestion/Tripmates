package com.tripmates.backend.publications.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import com.tripmates.backend.publications.service.PublicationService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripmates.backend.publications.dto.BusinessPublicationRequestDTO;
import java.util.List;
import com.tripmates.backend.common.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/publications")
@Tag(name = "Publications", description = "Publication management endpoints (services, hostings, etc.)")
public class PublicationController {

    @Autowired
    private PublicationService publicationService;

    @Autowired
    private ObjectMapper mapper;

    @PostMapping(value = "/business", consumes = "multipart/form-data")
    @io.swagger.v3.oas.annotations.Operation(summary = "Create a new business publication", description = "Creates a new business publication with the provided data and optional images.\n\n"
            +
            "### Request Structure\n" +
            "- `data`: (required) JSON with the publication data.\n" +
            "- `files`: (optional) Image files for the publication (JPG, PNG, etc.).\n\n" +
            "### Required Fields\n" +
            "- `title`: Publication title (cannot be empty)\n" +
            "- `description`: Business publication description (cannot be empty)\n\n" +
            "### Optional Fields\n" +
            "- `phoneNumber`: Business contact number\n" +
            "- `email`: Business contact email (must be valid email format)\n" +
            "- `location`: Business physical location\n" +
            "- `openingDays`: List of business opening days (e.g., [\"MONDAY\", \"TUESDAY\"])\n" +
            "- `attentionSchedule`: Object containing `openingTime` and `closingTime` in HH:MM format\n" +
            "- `exceptionalClosingDays`: List of dates when business is closed (YYYY-MM-DD format)\n" +
            "- `tags`: List of tags to categorize the business\n\n" +
            "### Example Request\n" +
            "```json\n" +
            "{\n" +
            "  \"title\": \"Mountain lodge\",\n" +
            "  \"description\": \"Beautiful place with amazing views and full amenities.\",\n" +
            "  \"phoneNumber\": \"+541112345678\",\n" +
            "  \"email\": \"contact@hostel.com\",\n" +
            "  \"location\": \"San Carlos de Bariloche, Argentina\",\n" +
            "  \"openingDays\": [\"MONDAY\", \"TUESDAY\", \"WEDNESDAY\", \"THURSDAY\", \"FRIDAY\"],\n" +
            "  \"attentionSchedule\": { \"openingTime\": \"09:00\", \"closingTime\": \"18:00\" },\n" +
            "  \"exceptionalClosingDays\": [\"2025-12-25\", \"2025-01-01\"],\n" +
            "  \"tags\": [\"hostel\", \"mountain\", \"nature\"]\n" +
            "}\n" +
            "```")
    public ResponseEntity<?> uploadBusinessPublication(
            @Parameter(description = "JSON string containing the business publication data. Required fields: title (non-empty), description (non-empty). Optional fields: phoneNumber, email (must be valid format), location, openingDays, attentionSchedule, exceptionalClosingDays, tags.") @RequestPart("data") String data,
            @Parameter(description = "Optional image files for the publication. Supported formats: JPG, PNG, etc.") @RequestPart(value = "files", required = false) List<MultipartFile> files,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            BusinessPublicationRequestDTO publication = mapper.readValue(data, BusinessPublicationRequestDTO.class);
            return ResponseEntity.ok()
                    .body(publicationService.createBusinessPublication(publication, files, userDetails.getUsername()));
        } catch (Exception e) {
            throw new BadRequestException("Error parsing JSON: " + e.getMessage());
        }
    }

    @GetMapping("/mine")
    @io.swagger.v3.oas.annotations.Operation(summary = "List my publications", description = "Returns all publications owned by the authenticated user.")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Publications fetched successfully")
    })
    public ResponseEntity<?> listMyPublications(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(publicationService.listMyPublications(userDetails.getUsername()));
    }

    @PatchMapping(value = "/{id}", consumes = "multipart/form-data")
    @io.swagger.v3.oas.annotations.Operation(summary = "Update a publication", description = "Updates an existing publication with JSON data and optional images.\n\n"
            + "Multipart request structure:\n"
            + "- `data`: (required) JSON with the fields to update.\n"
            + "- `files`: (optional) Images for the publication (JPG, PNG, etc.).\n\n"
            + "Example JSON for the `data` part:\n"
            + "```json\n"
            + "{\n"
            + "  \"title\": \"New title\",\n"
            + "  \"description\": \"Updated description\",\n"
            + "  \"phoneNumber\": \"+541112345678\",\n"
            + "  \"email\": \"contact@hostel.com\",\n"
            + "  \"location\": \"123 Address, City\",\n"
            + "  \"openingDays\": [\"MONDAY\", \"TUESDAY\"],\n"
            + "  \"attentionSchedule\": { \"openingTime\": \"09:00\", \"closingTime\": \"18:00\" },\n"
            + "  \"exceptionalClosingDays\": [\"2025-12-25\"]\n"
            + "}\n"
            + "```")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Publication updated successfully", content = @io.swagger.v3.oas.annotations.media.Content(mediaType = "application/json", schema = @io.swagger.v3.oas.annotations.media.Schema(implementation = com.tripmates.backend.publications.dto.BusinessPublicationResponseDTO.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request")
    })
    public ResponseEntity<?> updateBusinessPublication(
            @PathVariable String id,
            @RequestPart("data") String data,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            BusinessPublicationRequestDTO dto = mapper.readValue(data, BusinessPublicationRequestDTO.class);
            return ResponseEntity.ok().body(
                    publicationService.updatePublication(id, dto, files, userDetails.getUsername()));
        } catch (Exception e) {
            throw new BadRequestException("Error al parsear el JSON: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    @io.swagger.v3.oas.annotations.Operation(summary = "Get my publication", description = "Obtains a publication by id, only if it belongs to the authenticated user.")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Publication obtained successfully", content = @io.swagger.v3.oas.annotations.media.Content(mediaType = "application/json", schema = @io.swagger.v3.oas.annotations.media.Schema(implementation = com.tripmates.backend.publications.dto.BusinessPublicationResponseDTO.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Publication does not exist or does not belong to the user")
    })
    public ResponseEntity<?> getMyPublication(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(publicationService.getMyPublication(id, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    @io.swagger.v3.oas.annotations.Operation(summary = "Delete my publication", description = "Deletes a publication by id, only if it belongs to the authenticated user.")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "Publication deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Not found or not owned by user")
    })
    public ResponseEntity<Void> deleteMyPublication(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        publicationService.deletePublication(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

}
