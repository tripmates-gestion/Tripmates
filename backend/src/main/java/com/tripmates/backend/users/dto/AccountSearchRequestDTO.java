package com.tripmates.backend.users.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.tripmates.backend.common.types.*;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.validation.annotation.Validated;

import java.util.List;

@Validated
public record AccountSearchRequestDTO(
		/* For all accounts types */
		@Schema(description = "Filter by user's username") String username,
		/* For user's accounts */
		@Schema(description = "Filter by user's followers") Integer followers,
		@Schema(description = "Filter by user's followings") Integer followings,
		/* For business's accounts */
		@Schema(description = "Filter by business's average price") AveragePrice averagePrice,
		@Schema(description = "Filter by business's location") String location,
		@Schema(description = "Filter by business's type") BusinessType businessType,
		@Schema(description = "Filter by restaurant's type") RestaurantType restaurantType,
		@Schema(description = "Filter by hotel's type") HotelType hotelType,
		@Schema(description = "Filter by restaurant's attention schedule") AttentionSchedule attentionSchedule,
		@Schema(description = "Filter by hotel's room packs") @JsonProperty("roomPacks") List<RoomPack> roomPacksList) {
}
