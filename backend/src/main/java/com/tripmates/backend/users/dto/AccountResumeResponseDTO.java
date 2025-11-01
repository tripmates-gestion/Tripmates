package com.tripmates.backend.users.dto;

import com.tripmates.backend.common.types.*;
import com.tripmates.backend.users.entity.mongo.Account;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.DayOfWeek;
import java.util.List;

@Schema(description = "Account profile response DTO")
public record AccountResumeResponseDTO(@Schema(description = "Account's ID") String id,
		@Schema(description = "Account's email") String email,
		@Schema(description = "Account's avatar URL") String avatarURL,
		@Schema(description = "Account's name") String name, @Schema(description = "Account's role") Role role,
		@Schema(description = "Business account's description") String description,
		@Schema(description = "Business account's location") String location,
		@Schema(description = "Business account's phone number") String phoneNumber,
		@Schema(description = "Business account's public email") String publicEmail,
		@Schema(description = "Business account's profile image URLs") List<String> profileImageUrls,
		@Schema(description = "Business account's business type") BusinessType businessType,
		@Schema(description = "Business account's average price") AveragePrice averagePrice,
		@Schema(description = "Restaurant account's type") RestaurantType restaurantType,
		@Schema(description = "Restaurant account's attention schedule") AttentionSchedule attentionSchedule,
		@Schema(description = "Restaurant account's opening days") List<DayOfWeek> openingDays,
		@Schema(description = "Restaurant account's menu") List<MenuItem> menu,
		@Schema(description = "Hotel account's type") HotelType hotelType,
		@Schema(description = "Hotel account's room packs") List<RoomPack> roomPacks) {

	/**
	 * Retorna un resumen de los atributos claves de {@link Account}.
	 * @param account cuenta de usuario del sistema.
	 * @return {@link AccountResumeResponseDTO}.
	 */
	public static AccountResumeResponseDTO fromAccount(Account account) {
		return new AccountResumeResponseDTO(account.getId(), account.getAvatarURL(), account.getName(),
				account.getEmail(), account.getRole(), account.getDescription(), account.getLocation(),
				account.getPhoneNumber(), account.getPublicEmail(), account.getProfileImageUrls(),
				account.getBusinessType(), account.getAveragePrice(), account.getRestaurantType(),
				account.getAttentionSchedule(), account.getOpeningDays(), account.getMenu(), account.getHotelType(),
				account.getRoomPacks());
	}

}
