package com.tripmates.backend.users.dto;

import com.tripmates.backend.common.types.*;
import com.tripmates.backend.users.entity.mongo.Account;
import io.swagger.v3.oas.annotations.media.Schema;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.DayOfWeek;
import java.util.List;

@Schema(description = "Account profile response DTO")
@JsonInclude(JsonInclude.Include.NON_NULL)
public record AccountResumeResponseDTO(@Schema(description = "Account's ID") String id,
		@Schema(description = "Account's avatar URL") String avatarURL,
		@Schema(description = "Account's name") String name, @Schema(description = "Account's email") String email,
		@Schema(description = "Account's role") Role role,
		@Schema(description = "Business account's description") String description,
		/* Para negocios*/
		@Schema(description = "Business account's business type") BusinessType businessType,
		@Schema(description = "Business account's location") String location,
		@Schema(description = "Business account's phone number") String phoneNumber,
		@Schema(description = "Business account's public email") String publicEmail,
		@Schema(description = "Business account's profile image URLs") List<String> profileImageUrls,
		@Schema(description = "Business account's average price") AveragePrice averagePrice,
		/* Para restaurantes*/
		@Schema(description = "Restaurant account's type") RestaurantType restaurantType,
		@Schema(description = "Restaurant account's attention schedule") AttentionSchedule attentionSchedule,
		@Schema(description = "Restaurant account's opening days") List<DayOfWeek> openingDays,
		@Schema(description = "Restaurant account's menu") List<MenuItem> menu,
        /* Para hoteles*/
		@Schema(description = "Hotel account's type") HotelType hotelType,
		@Schema(description = "Hotel account's room packs") List<RoomPack> roomPacks) {

	/**
	 * Retorna un resumen de los atributos claves de {@link Account}.
	 * @param account cuenta de usuario del sistema.
	 * @return {@link AccountResumeResponseDTO}.
	 */
	public static AccountResumeResponseDTO fromAccount(Account account) {
		Role role = account.getRole();
		BusinessType bt = (role == Role.BUSINESS) ? account.getBusinessType() : null;

		String desc = (role == Role.BUSINESS) ? account.getDescription() : null;
		String loc = (role == Role.BUSINESS) ? account.getLocation() : null;
		String phone = (role == Role.BUSINESS) ? account.getPhoneNumber() : null;
		String pubEmail = (role == Role.BUSINESS) ? account.getPublicEmail() : null;
		List<String> images = (role == Role.BUSINESS) ? account.getProfileImageUrls() : null;

		// Campos específicos por tipo de negocio
		AveragePrice avgPrice = null;
		RestaurantType restType = null;
		AttentionSchedule schedule = null;
		List<DayOfWeek> days = null;
		List<MenuItem> menuItems = null;
		HotelType hotelT = null;
		List<RoomPack> packs = null;

		if (role == Role.BUSINESS) {
			if (bt == BusinessType.RESTAURANT) {
				avgPrice = account.getAveragePrice();
				restType = account.getRestaurantType();
				schedule = account.getAttentionSchedule();
				days = account.getOpeningDays();
				menuItems = account.getMenu();
			}
			else if (bt == BusinessType.HOTEL) {
				hotelT = account.getHotelType();
				packs = account.getRoomPacks();
			}
		}

		return new AccountResumeResponseDTO(
				account.getId(),
				account.getAvatarURL(),
				account.getName(),
				account.getEmail(),
				role,
				desc,
				bt,
				loc,
				phone,
				pubEmail,
				images,
				avgPrice,
				restType,
				schedule,
				days,
				menuItems,
				hotelT,
				packs
		);
	}

}
