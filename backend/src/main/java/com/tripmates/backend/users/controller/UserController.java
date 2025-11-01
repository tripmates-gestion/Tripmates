package com.tripmates.backend.users.controller;

import com.tripmates.backend.users.dto.AccountResumeResponseDTO;
import com.tripmates.backend.users.dto.AccountSearchRequestDTO;
import com.tripmates.backend.users.entity.mongo.Account;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.tripmates.backend.common.constants.DocumentationObjectsExamples;
import com.tripmates.backend.common.dto.ErrorDTO;
import com.tripmates.backend.common.service.parsing.ObjectParsingService;
import com.tripmates.backend.users.dto.UserUpdateRequestDTO;
import com.tripmates.backend.users.service.UserService;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import org.springdoc.core.annotations.ParameterObject;

@RestController
@RequestMapping("/users")
@Tag(name = "Users", description = "User management endpoints")
public class UserController {

	private final UserService userService;

	@Autowired
	private ObjectParsingService parsingService;

	public UserController(UserService userService) {
		this.userService = userService;
	}

	@GetMapping("/me")
	@Operation(summary = "Obtains an account from the system")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "204", description = "Account obtained successfully",
					content = { @Content(mediaType = "application/json",
							schema = @Schema(implementation = Account.class)) }),
			@ApiResponse(responseCode = "404", description = "Account not found", content = {
					@Content(mediaType = "application/json", schema = @Schema(implementation = ErrorDTO.class)) }) })
	public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
		return ResponseEntity.ok().body(userService.getUser(userDetails.getUsername()));
	}

	@PostMapping("/search/business")
	@Operation(summary = "Obtains accounts that meet the filters", description = """
			Filters are received as query params via model attributes.

			Parametros:
			- averagePrice
			- location: ....
			- username:
			         - businessType
			         - restaurantType
			         - hotelType
			         - attentionSchedule: ...
			- roomPacks
			- page, size, sort: Pagination (e.g., sort=name,asc).""")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Account obtained successfully",
					content = { @Content(mediaType = "application/json",
							schema = @Schema(implementation = AccountResumeResponseDTO.class)) }),
			@ApiResponse(responseCode = "?", description = "?", content = {
					@Content(mediaType = "application/json", schema = @Schema(implementation = void.class)) }) })
	public ResponseEntity<?> search(@RequestBody AccountSearchRequestDTO accountSearchRequestDTO,
			@ParameterObject @PageableDefault Pageable pageable) {

		return ResponseEntity.ok().body(userService.search(accountSearchRequestDTO, pageable));
	}

	@PatchMapping(value = "/me", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@Operation(summary = "Update account profile", description = DocumentationObjectsExamples.UPDATE_PROFILE_EXAMPLE)
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Account's profile updated successfully",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = AccountResumeResponseDTO.class))),
			@ApiResponse(responseCode = "404", description = "Account not found",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = ErrorDTO.class))) })
	public ResponseEntity<?> updateProfileMultipart(@AuthenticationPrincipal UserDetails userDetails,
			@RequestPart("data") String data, @RequestPart(value = "avatar", required = false) MultipartFile avatar,
			@RequestPart(value = "files", required = false) List<MultipartFile> files) {

		UserUpdateRequestDTO userUpdateRequestDTO = parsingService.parseAndValidate(data, UserUpdateRequestDTO.class);
		return ResponseEntity
			.ok(userService.updateUser(userDetails.getUsername(), userUpdateRequestDTO, files, avatar));

	}

}
