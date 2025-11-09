package com.tripmates.backend.users.controller;

import com.tripmates.backend.users.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import org.springdoc.core.annotations.ParameterObject;

import com.tripmates.backend.common.constants.DocumentationObjectsExamples;
import com.tripmates.backend.common.dto.ErrorDTO;
import com.tripmates.backend.common.service.parsing.ObjectParsingService;
import com.tripmates.backend.users.service.UserService;
import com.tripmates.backend.common.types.MenuItem;
import com.tripmates.backend.common.types.RoomPack;

import java.util.List;

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
	@Operation(summary = "Obtains user's account")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "204", description = "Account obtained successfully",
					content = { @Content(mediaType = "application/json",
							schema = @Schema(implementation = AccountResumeResponseDTO.class)) }),
			@ApiResponse(responseCode = "404", description = "Account not found", content = {
					@Content(mediaType = "application/json", schema = @Schema(implementation = ErrorDTO.class)) }) })
	public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
		return ResponseEntity.ok().body(userService.getUserAccount(userDetails.getUsername()));
	}

	@PatchMapping(value = "/me", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@Operation(summary = "Updates user's account profile",
			description = DocumentationObjectsExamples.UPDATE_PROFILE_EXAMPLE)
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "User's account profile updated successfully",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = AccountResumeResponseDTO.class))),
			@ApiResponse(responseCode = "404", description = "Account not found",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = ErrorDTO.class))) })
	public ResponseEntity<?> updateProfile(@AuthenticationPrincipal UserDetails userDetails,
			@RequestPart("data") String data, @RequestPart(value = "avatar", required = false) MultipartFile avatar,
			@RequestPart(value = "files", required = false) List<MultipartFile> files) {
		return ResponseEntity.ok(userService.updateUserAccount(userDetails.getUsername(),
				parsingService.parseAndValidate(data, AccountUpdateRequestDTO.class), files, avatar));

	}

	@PostMapping(value = "/search/business", consumes = MediaType.APPLICATION_JSON_VALUE,
			produces = MediaType.APPLICATION_JSON_VALUE)
	@Operation(summary = "Search business's accounts")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Account obtained successfully",
					content = { @Content(mediaType = "application/json",
							schema = @Schema(implementation = AccountResumeResponseDTO.class)) }),
			@ApiResponse(responseCode = "204", description = "No account matched the filters", content = {
					@Content(mediaType = "application/json", schema = @Schema(implementation = void.class)) }) })
	public ResponseEntity<?> searchBusiness(@RequestBody AccountSearchRequestDTO accountSearchRequestDTO,
			@ParameterObject @PageableDefault Pageable pageable) {
		Page<AccountResumeResponseDTO> accountResumeResponseDTOPage = userService.searchAccount(accountSearchRequestDTO,
				pageable);
		if (accountResumeResponseDTOPage.getTotalElements() == 0)
			return ResponseEntity.noContent().build();

		return ResponseEntity.ok().body(accountResumeResponseDTOPage);
	}

	@PostMapping(value = "/search/user", consumes = MediaType.APPLICATION_JSON_VALUE,
			produces = MediaType.APPLICATION_JSON_VALUE)
	@Operation(summary = "Search user's accounts")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Account obtained successfully",
					content = { @Content(mediaType = "application/json",
							schema = @Schema(implementation = AccountResumeResponseDTO.class)) }),
			@ApiResponse(responseCode = "204", description = "No account matched the filters", content = {
					@Content(mediaType = "application/json", schema = @Schema(implementation = void.class)) }) })
	public ResponseEntity<?> searchUser(@RequestBody AccountSearchRequestDTO accountSearchRequestDTO,
			@ParameterObject @PageableDefault Pageable pageable) {
		Page<AccountResumeResponseDTO> accountResumeResponseDTOPage = userService.searchAccount(accountSearchRequestDTO,
				pageable);
		if (accountResumeResponseDTOPage.getTotalElements() == 0)
			return ResponseEntity.noContent().build();

		return ResponseEntity.ok().body(accountResumeResponseDTOPage);
	}

	@PostMapping("/plans/create")
	@Operation(summary = "User plan's creation", description = DocumentationObjectsExamples.USER_PLAN_CREATION)
	@ApiResponses(
			value = {
					@ApiResponse(responseCode = "200", description = "User's plan created successfully",
							content = @Content(mediaType = "application/json",
									schema = @Schema(implementation = void.class))),
					@ApiResponse(responseCode = "404", description = "User not found",
							content = @Content(mediaType = "application/json",
									schema = @Schema(implementation = ErrorDTO.class))),
					@ApiResponse(responseCode = "401", description = "Invalid credentials",
							content = @Content(mediaType = "application/json",
									schema = @Schema(implementation = ErrorDTO.class))) })
	public ResponseEntity<?> createPlan(@RequestBody PlanCreationRequestDTO planCreationRequestDTO,
			@AuthenticationPrincipal UserDetails userDetails) {
		userService.createPlan(userDetails.getUsername(), planCreationRequestDTO);

		return ResponseEntity.noContent().build();
	}
	@PatchMapping("/plans/{id}")
	@Operation(summary = "Patch user's plan by id", description = DocumentationObjectsExamples.USER_PLAN_UPDATE_EXAMPLE)
	@ApiResponses(value = {
			@ApiResponse(responseCode = "204", description = "User's plan updated successfully",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = void.class))),
			@ApiResponse(responseCode = "404", description = "User not found",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = ErrorDTO.class))),
			@ApiResponse(responseCode = "401", description = "Invalid credentials",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = ErrorDTO.class))) })
	public ResponseEntity<?> updatePlan(@PathVariable("id") String planId,
			@RequestBody PlanUpdateRequestDTO planUpdateRequestDTO,
			@AuthenticationPrincipal UserDetails userDetails) {
		userService.updatePlan(userDetails.getUsername(), planId, planUpdateRequestDTO);
		return ResponseEntity.noContent().build();
	}
	@DeleteMapping("/plans/{id}")
	@Operation(summary = "Delete user's plan by id")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "204", description = "User's plan deleted successfully",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = void.class))),
			@ApiResponse(responseCode = "404", description = "User not found",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = ErrorDTO.class))),
			@ApiResponse(responseCode = "401", description = "Invalid credentials",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = ErrorDTO.class))) })
	public ResponseEntity<?> deletePlan(@PathVariable("id") String planId,
			@AuthenticationPrincipal UserDetails userDetails) {
		userService.deletePlan(userDetails.getUsername(), planId);
		return ResponseEntity.noContent().build();
	}
	@GetMapping("/plans/list")
	@Operation(description = "Obtains user's plans or plans where he belongs")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "User's plans obtained successfully",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = PlanResumeResponseDTO.class))),
			@ApiResponse(responseCode = "404", description = "User not found",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = ErrorDTO.class))) })
	public ResponseEntity<?> getPlans(@AuthenticationPrincipal UserDetails userDetails) {
		List<PlanResumeResponseDTO> planResumeResponseDTOList = userService.getPlans(userDetails.getUsername());

		if (planResumeResponseDTOList.isEmpty())
			return ResponseEntity.noContent().build();

		return ResponseEntity.ok(planResumeResponseDTOList);
	}

	@PostMapping(value = "/me/restaurant", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@Operation(summary = "Posts a menu item", description = DocumentationObjectsExamples.RESTAURANT_APPEND_EXAMPLE)
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Menu item appended successfully",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = AccountResumeResponseDTO.class))),
			@ApiResponse(responseCode = "404", description = "Account not found",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = ErrorDTO.class))) })
	public ResponseEntity<?> postMenuItem(@AuthenticationPrincipal UserDetails userDetails, @Parameter(
			description = "JSON with non-image fields (foodName, price, description). Images must be sent via 'files'.") @RequestPart("data") String data,
			@Parameter(
					description = "Optional image files for the menu item. Supported formats: JPG, PNG, etc.") @RequestPart(
							value = "files", required = false) List<MultipartFile> files) {
		return ResponseEntity.ok(userService.addMenuItem(userDetails.getUsername(),
				parsingService.parseAndValidate(data, MenuItem.class), files));
	}

	@PatchMapping(value = "/me/restaurant/{index}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@Operation(summary = "Updates a menu item by its index (multipart)",
			description = DocumentationObjectsExamples.RESTAURANT_UPDATE_EXAMPLE)
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Menu item updated successfully",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = AccountResumeResponseDTO.class))),
			@ApiResponse(responseCode = "404", description = "Account not found",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = ErrorDTO.class))) })
	public ResponseEntity<?> updateMenuItem(@AuthenticationPrincipal UserDetails userDetails,
			@Parameter(description = "0-based index of the menu item to update") @PathVariable("index") int index,
			@Parameter(
					description = "Optional JSON string containing updated non-image fields (foodName, price, description) and deletePhotoIndexes to remove specific photos by 0-based indexes. If omitted, only photos will be modified.") @RequestPart(
							value = "data", required = false) String data,
			@Parameter(
					description = "Optional image files to append to the item's photos. Supported formats: JPG, PNG, etc.") @RequestPart(
							value = "files", required = false) List<MultipartFile> files) {
		MenuItemUpdateDTO menuItemUpdateDTO = (data != null && !data.isBlank())
				? parsingService.parseAndValidate(data, MenuItemUpdateDTO.class) : null;

		MenuItem menuItem = (menuItemUpdateDTO != null) ? new MenuItem(null, menuItemUpdateDTO.foodName(),
				menuItemUpdateDTO.price(), menuItemUpdateDTO.description()) : null;

		List<Integer> deletePhotoIndexes = (menuItemUpdateDTO != null) ? menuItemUpdateDTO.deletePhotoIndexes() : null;

		return ResponseEntity
			.ok(userService.updateMenuItem(userDetails.getUsername(), index, menuItem, files, deletePhotoIndexes));
	}

	@DeleteMapping(value = "/me/restaurant/{index}")
	@Operation(summary = "Delete one menu item by index", description = """
			Removes the item at the provided 0-based position.
			""")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Menu item deleted successfully",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = AccountResumeResponseDTO.class))),
			@ApiResponse(responseCode = "404", description = "Account not found",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = ErrorDTO.class))) })
	public ResponseEntity<?> deleteMenuItem(@AuthenticationPrincipal UserDetails userDetails,
			@Parameter(description = "0-based index of the menu item to delete") @PathVariable("index") int index) {
		return ResponseEntity.ok(userService.deleteMenuItem(userDetails.getUsername(), index));
	}

	@PostMapping(value = "/me/hosting", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@Operation(summary = "Append one room pack (multipart)",
			description = DocumentationObjectsExamples.HOSTING_APPEND_EXAMPLE)
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Room pack appended successfully",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = AccountResumeResponseDTO.class))),
			@ApiResponse(responseCode = "404", description = "Account not found",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = ErrorDTO.class))) })
	public ResponseEntity<?> postRoomPack(@AuthenticationPrincipal UserDetails userDetails, @Parameter(
			description = "JSON with non-image fields (checkInDate, checkOutDate, numberOfGuests, services, price, description). Images must be sent via 'files'.") @RequestPart("data") String data,
			@Parameter(
					description = "Optional image files for the room pack. Supported formats: JPG, PNG, etc.") @RequestPart(
							value = "files", required = false) List<MultipartFile> files) {
		return ResponseEntity.ok(userService.addRoomPack(userDetails.getUsername(),
				parsingService.parseAndValidate(data, RoomPack.class), files));
	}

	@PatchMapping(value = "/me/hosting/{index}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@Operation(summary = "Update one room pack by index (multipart)",
			description = DocumentationObjectsExamples.HOSTING_UPDATE_EXAMPLE)
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Room pack updated successfully",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = AccountResumeResponseDTO.class))),
			@ApiResponse(responseCode = "404", description = "Account not found",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = ErrorDTO.class))) })
	public ResponseEntity<?> updateRoomPack(@AuthenticationPrincipal UserDetails userDetails,
			@Parameter(description = "0-based index of the room pack to update") @PathVariable("index") int index,
			@Parameter(
					description = "Optional JSON string containing updated non-image fields (checkInDate, checkOutDate, numberOfGuests, services, price, description) and deletePhotoIndexes to remove specific photos by 0-based indexes. If omitted, only photos will be modified.") @RequestPart(
							value = "data", required = false) String data,
			@Parameter(
					description = "Optional image files to append to the room pack photos. Supported formats: JPG, PNG, etc.") @RequestPart(
							value = "files", required = false) List<MultipartFile> files) {
		RoomPackUpdateDTO roomPackUpdateDTO = (data != null && !data.isBlank())
				? parsingService.parseAndValidate(data, RoomPackUpdateDTO.class) : null;

		RoomPack roomPack = (roomPackUpdateDTO != null) ? new RoomPack(roomPackUpdateDTO.checkInDate(),
				roomPackUpdateDTO.checkOutDate(), roomPackUpdateDTO.numberOfGuests(), roomPackUpdateDTO.services(),
				roomPackUpdateDTO.price(), roomPackUpdateDTO.description(), null) : null;

		List<Integer> deletePhotoIndexes = (roomPackUpdateDTO != null) ? roomPackUpdateDTO.deletePhotoIndexes() : null;

		return ResponseEntity
			.ok(userService.updateRoomPack(userDetails.getUsername(), index, roomPack, files, deletePhotoIndexes));
	}

	@DeleteMapping(value = "/me/hosting/{index}")
	@Operation(summary = "Delete one room pack by index", description = """
			Removes the room pack at the provided 0-based position.
			""")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "Room pack deleted successfully",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = AccountResumeResponseDTO.class))),
			@ApiResponse(responseCode = "404", description = "Account not found",
					content = @Content(mediaType = "application/json",
							schema = @Schema(implementation = ErrorDTO.class))) })
	public ResponseEntity<?> deleteRoomPack(@AuthenticationPrincipal UserDetails userDetails,
			@Parameter(description = "0-based index of the room pack to delete") @PathVariable("index") int index) {
		return ResponseEntity.ok(userService.deleteRoomPack(userDetails.getUsername(), index));
	}

}
