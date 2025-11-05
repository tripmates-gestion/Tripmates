package com.tripmates.backend.users.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.util.List;

public record RoomPackUpdateDTO(
		@Schema(description = "Room's check in date") @JsonProperty("checkInDate") LocalDate checkInDate,
		@Schema(description = "Room's check out day") @JsonProperty("checkOutDate") LocalDate checkOutDate,
		@Schema(description = "Room's number of guests") @JsonProperty("numberOfGuests") Integer numberOfGuests,
		@Schema(description = "Room's services") @JsonProperty("services") @JsonSetter(
				nulls = Nulls.AS_EMPTY) List<String> services,
		@Schema(description = "Room's price") @JsonProperty("price") Float price,
		@Schema(description = "Room's description") @JsonProperty("description") String description,
		@Schema(description = "Optional list of 0-based photo indexes to delete from the room pack") @JsonProperty("deletePhotoIndexes") @JsonSetter(
				nulls = Nulls.AS_EMPTY) List<Integer> deletePhotoIndexes) {
}
