package com.tripmates.backend.users.dto;

import com.tripmates.backend.common.types.*;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.validation.annotation.Validated;

import java.util.List;

@Validated
public record UserSearchRequestDTO(
        @Schema(description = "") AveragePrice averagePrice,
        @Schema(description = "") String location,
        @Schema(description = "") String username,
		@Schema(description = "User's business type") BusinessType businessType,

        @Schema(description = "") List<MenuItem> menuItemList,
        @Schema(description = "") RestaurantType restaurantType,

        @Schema(description = "") AttentionSchedule attentionSchedule,
        @Schema(description = "") HotelType hotelType,
        @Schema(description = "") List<RoomPack> roomPacksList
) {
}
