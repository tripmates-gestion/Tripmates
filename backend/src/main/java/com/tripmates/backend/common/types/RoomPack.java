package com.tripmates.backend.common.types;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

public record RoomPack(
		@Schema(description = "Room's check in date") @JsonFormat(
				pattern = "yyyy-MM-dd") @JsonProperty("checkInDate") LocalDate checkInDate,
		@Schema(description = "Room's check out day") @JsonFormat(
				pattern = "yyyy-MM-dd") @JsonProperty("checkOutDate") LocalDate checkOutDate,
		@Schema(description = "Room's number of guests") @JsonProperty("numberOfGuests") Integer numberOfGuests,
		@Schema(description = "Room's services") @JsonProperty("services") List<String> services,
		@Schema(description = "Room's price") @JsonProperty("price") Float price,
		@Schema(description = "Room's description") @JsonProperty("description") String description,
		@Schema(description = "Room's photos URLs") @JsonProperty("photosURLs") List<String> photosURLs) {
}
