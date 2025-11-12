package com.tripmates.backend.users.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.tripmates.backend.common.types.*;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.validation.annotation.Validated;

import java.util.List;

@Validated
public record AccountSearchRequestDTO(@Schema(description = "Filter by account's role") Role role,
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

	/**
	 * Returns a {@link AccountSearchRequestDTO} from {@link BusinessSearchRequestDTO}.
	 * @param businessSearchRequestDTO DTO with business filters.
	 * @return {@link AccountSearchRequestDTO}.
	 */
	public static AccountSearchRequestDTO fromBusinessSearchRequestDTO(
			BusinessSearchRequestDTO businessSearchRequestDTO) {
		return new AccountSearchRequestDTO(Role.BUSINESS, businessSearchRequestDTO.username(), null, null,
				businessSearchRequestDTO.averagePrice(), businessSearchRequestDTO.location(),
				businessSearchRequestDTO.businessType(), businessSearchRequestDTO.restaurantType(),
				businessSearchRequestDTO.hotelType(), businessSearchRequestDTO.attentionSchedule(),
				businessSearchRequestDTO.roomPacksList());
	}

	/**
	 * Returns a {@link AccountSearchRequestDTO} from {@link UserSearchRequestDTO}.
	 * @param userSearchRequestDTO DTO with business filters.
	 * @return {@link AccountSearchRequestDTO}.
	 */
	public static AccountSearchRequestDTO fromUserSearchRequestDTO(UserSearchRequestDTO userSearchRequestDTO) {
		return new AccountSearchRequestDTO(Role.USER, userSearchRequestDTO.username(), userSearchRequestDTO.followers(),
				userSearchRequestDTO.followings(), null, userSearchRequestDTO.location(), null, null, null, null, null);
	}

}
