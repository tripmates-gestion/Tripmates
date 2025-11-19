package com.tripmates.backend.users.dto.account;

import com.tripmates.backend.common.types.*;
import com.tripmates.backend.users.entity.mongo.Account;
import io.swagger.v3.oas.annotations.media.Schema;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.DayOfWeek;
import java.util.List;

@Schema(description = "Account's resume profile response DTO")
@JsonInclude(JsonInclude.Include.NON_NULL)
public record AccountResumeResponseDTO(@Schema(description = "Account's ID") String id,
		@Schema(description = "Account's avatar URL") String avatarURL,
		@Schema(description = "Account's name") String name, @Schema(description = "Account's email") String email,
		@Schema(description = "Account's role") Role role,
		@Schema(description = "Business account's description") String description,
		/* For business's accounts */
		@Schema(description = "Business account's business type") BusinessType businessType,
		@Schema(description = "Business account's location") String location,
		@Schema(description = "Business account's phone number") String phoneNumber,
		@Schema(description = "Business account's public email") String publicEmail,
		@Schema(description = "Business account's profile image URLs") List<String> profileImageUrls,
		@Schema(description = "Business account's average price") AveragePrice averagePrice,
		/* For business's restaurant accounts */
		@Schema(description = "Restaurant account's type") RestaurantType restaurantType,
		@Schema(description = "Restaurant account's attention schedule") AttentionSchedule attentionSchedule,
		@Schema(description = "Restaurant account's opening days") List<DayOfWeek> openingDays,
		@Schema(description = "Restaurant account's menu") List<MenuItem> menu,
		/* For business's hosting accounts */
		@Schema(description = "Hotel account's type") HotelType hotelType,
		@Schema(description = "Hotel account's room packs") List<RoomPack> roomPacks) {

	/**
	 * Returns a resume from the attributes of a user account.
	 * @param account user account.
	 * @return {@link AccountResumeResponseDTO}.
	 */
	public static AccountResumeResponseDTO fromAccount(Account account) {
		Role role = account.getRole();

		if (role != Role.BUSINESS) {
			return new AccountResumeResponseDTO(account.getId(), account.getAvatarURL(), account.getName(),
					account.getEmail(), role, account.getDescription(), null, // businessType
					null, // location
					null, // phoneNumber
					null, // publicEmail
					null, // profileImageUrls
					null, // averagePrice
					null, // restaurantType
					null, // attentionSchedule
					null, // openingDays
					null, // menu
					null, // hotelType
					null // roomPacks
			);
		}

		BusinessType businessType = account.getBusinessType();
		String location = account.getLocation();
		String phoneNumber = account.getPhoneNumber();
		String publicEmail = account.getPublicEmail();
		List<String> imageURLsList = account.getProfileImageUrls();

		if (businessType == BusinessType.RESTAURANT) {
			return new AccountResumeResponseDTO(account.getId(), account.getAvatarURL(), account.getName(),
					account.getEmail(), role, account.getDescription(), businessType, location, phoneNumber,
					publicEmail, imageURLsList, account.getAveragePrice(), account.getRestaurantType(),
					account.getAttentionSchedule(), account.getOpeningDays(), account.getMenu(), null, // hotelType
					null // roomPacks
			);
		}
		else {
			return new AccountResumeResponseDTO(account.getId(), account.getAvatarURL(), account.getName(),
					account.getEmail(), role, account.getDescription(), businessType, location, phoneNumber,
					publicEmail, imageURLsList, null, // averagePrice
					null, // restaurantType
					null, // attentionSchedule
					null, // openingDays
					null, // menu
					account.getHotelType(), account.getRoomPacks());
		}
	}

}
