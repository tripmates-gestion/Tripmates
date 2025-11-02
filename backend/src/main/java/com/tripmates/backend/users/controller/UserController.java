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
import org.springframework.data.domain.Page;
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
import com.tripmates.backend.common.types.MenuItem;
import com.tripmates.backend.common.types.RoomPack;

import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;
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

    

    @PostMapping(value = "/me/restaurant", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Append one menu item (multipart)",
            description = """
                    Send one MenuItem in 'data' (JSON) and 0..N images in 'files'.

                    Example data (JSON):
                    {
                      "foodName": "Double Burger",
                      "price": 9.99,
                      "description": "With cheddar and bacon",
                      "photosURLs": []
                    }

                    """)
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Menu item appended successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = AccountResumeResponseDTO.class))),
            @ApiResponse(responseCode = "404", description = "Account not found",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorDTO.class)))
    })
    public ResponseEntity<?> appendMenuItem(@AuthenticationPrincipal UserDetails userDetails,
                                            @Parameter(description = "JSON string containing the menu item. Required fields: foodName (non-empty), price (number). Optional: description (string), photosURLs (array of strings).") @RequestPart("data") String data,
                                            @Parameter(description = "Optional image files for the menu item. Supported formats: JPG, PNG, etc.") @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        MenuItem item = parsingService.parseAndValidate(data, MenuItem.class);
        return ResponseEntity.ok(userService.addMenuItem(userDetails.getUsername(), item, files));
    }

    @PatchMapping(value = "/me/restaurant/{index}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update one menu item by index (multipart)",
            description = """
                    Send one MenuItem in 'data' (JSON) and 0..N images in 'files'.
                    Uploaded images are appended to the 'photosURLs' provided in the JSON.

                    Example data (JSON):
                    {
                      "foodName": "Triple Burger",
                      "price": 11.5,
                      "description": "With cheddar, bacon and egg",
                      "photosURLs": [""]
                    }

                    """)
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Menu item updated successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = AccountResumeResponseDTO.class))),
            @ApiResponse(responseCode = "404", description = "Account not found",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorDTO.class)))
    })
    public ResponseEntity<?> updateMenuItem(@AuthenticationPrincipal UserDetails userDetails,
                                            @Parameter(description = "0-based index of the menu item to update") @PathVariable("index") int index,
                                            @Parameter(description = "JSON string containing the updated menu item. Required fields: foodName (non-empty), price (number). Optional: description (string), photosURLs (array of strings).") @RequestPart("data") String data,
                                            @Parameter(description = "Optional image files to append to the item's photos. Supported formats: JPG, PNG, etc.") @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        MenuItem item = parsingService.parseAndValidate(data, MenuItem.class);
        return ResponseEntity.ok(userService.updateMenuItem(userDetails.getUsername(), index, item, files));
    }

    @DeleteMapping(value = "/me/restaurant/{index}")
    @Operation(summary = "Delete one menu item by index",
            description = """
                    Removes the item at the provided 0-based position.
                    """)
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Menu item deleted successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = AccountResumeResponseDTO.class))),
            @ApiResponse(responseCode = "404", description = "Account not found",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorDTO.class)))
    })
    public ResponseEntity<?> deleteMenuItem(@AuthenticationPrincipal UserDetails userDetails,
                                            @Parameter(description = "0-based index of the menu item to delete") @PathVariable("index") int index) {
        return ResponseEntity.ok(userService.deleteMenuItem(userDetails.getUsername(), index));
    }

    

    @PostMapping(value = "/me/hosting", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Append one room pack (multipart)",
            description = """
                    Send one RoomPack in 'data' (JSON) and 0..N images in 'files'.

                    Example data (JSON):
                    {
                      "checkInDate": "2025-11-10",
                      "checkOutDate": "2025-11-12",
                      "numberOfGuests": 2,
                      "services": ["breakfast", "pool"],
                      "price": 250.0,
                      "description": "Suite with sea view",
                      "photosURLs": []
                    }
                    """)
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Room pack appended successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = AccountResumeResponseDTO.class))),
            @ApiResponse(responseCode = "404", description = "Account not found",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorDTO.class)))
    })
    public ResponseEntity<?> appendRoomPack(@AuthenticationPrincipal UserDetails userDetails,
                                            @Parameter(description = "JSON string containing the room pack. Required fields: checkInDate (yyyy-MM-dd), checkOutDate (yyyy-MM-dd), numberOfGuests (integer), price (number). Optional: services (array of strings), description (string), photosURLs (array of strings).") @RequestPart("data") String data,
                                            @Parameter(description = "Optional image files for the room pack. Supported formats: JPG, PNG, etc.") @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        RoomPack pack = parsingService.parseAndValidate(data, RoomPack.class);
        return ResponseEntity.ok(userService.addRoomPack(userDetails.getUsername(), pack, files));
    }

    @PatchMapping(value = "/me/hosting/{index}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update one room pack by index (multipart)",
            description = """
                    Send one RoomPack in 'data' (JSON) and 0..N images in 'files'.
                    Uploaded images are appended to the 'photosURLs' provided in the JSON.

                    Example data (JSON):
                    {
                      "checkInDate": "2025-11-15",
                      "checkOutDate": "2025-11-18",
                      "numberOfGuests": 3,
                      "services": ["breakfast","pool","gym"],
                      "price": 310.0,
                      "description": "Premium suite",
                      "photosURLs": ["https://cdn.example.com/prev-suite.jpg"]
                    }
                    """)
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Room pack updated successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = AccountResumeResponseDTO.class))),
            @ApiResponse(responseCode = "404", description = "Account not found",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorDTO.class)))
    })
    public ResponseEntity<?> updateRoomPack(@AuthenticationPrincipal UserDetails userDetails,
                                            @Parameter(description = "0-based index of the room pack to update") @PathVariable("index") int index,
                                            @Parameter(description = "JSON string containing the updated room pack. Required fields: checkInDate (yyyy-MM-dd), checkOutDate (yyyy-MM-dd), numberOfGuests (integer), price (number). Optional: services (array of strings), description (string), photosURLs (array of strings).") @RequestPart("data") String data,
                                            @Parameter(description = "Optional image files to append to the room pack photos. Supported formats: JPG, PNG, etc.") @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        RoomPack pack = parsingService.parseAndValidate(data, RoomPack.class);
        return ResponseEntity.ok(userService.updateRoomPack(userDetails.getUsername(), index, pack, files));
    }

    @DeleteMapping(value = "/me/hosting/{index}")
    @Operation(summary = "Delete one room pack by index",
            description = """
                    Removes the room pack at the provided 0-based position.
                    """)
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Room pack deleted successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = AccountResumeResponseDTO.class))),
            @ApiResponse(responseCode = "404", description = "Account not found",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ErrorDTO.class)))
    })
    public ResponseEntity<?> deleteRoomPack(@AuthenticationPrincipal UserDetails userDetails,
                                            @Parameter(description = "0-based index of the room pack to delete") @PathVariable("index") int index) {
        return ResponseEntity.ok(userService.deleteRoomPack(userDetails.getUsername(), index));
    }

    @GetMapping("/search")
    @Operation(summary = "Search accounts")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Account obtained successfully",
                    content = { @Content(mediaType = "application/json",
                            schema = @Schema(implementation = AccountResumeResponseDTO.class)) }),
            @ApiResponse(responseCode = "204", description = "No account matched the filters", content = {
                    @Content(mediaType = "application/json", schema = @Schema(implementation = void.class)) }) })
    public ResponseEntity<?> search(@RequestBody AccountSearchRequestDTO accountSearchRequestDTO,
            @ParameterObject @PageableDefault Pageable pageable) {
        Page<AccountResumeResponseDTO> accountResumeResponseDTOPage = userService.search(accountSearchRequestDTO,
                pageable);
        if (accountResumeResponseDTOPage.getTotalElements() == 0)
            return ResponseEntity.noContent().build();

        return ResponseEntity.ok().body(accountResumeResponseDTOPage);
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
