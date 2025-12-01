package com.tripmates.backend.users.dto.account;

import com.tripmates.backend.common.types.*;
import com.tripmates.backend.common.constants.ValidationErrorMessage;
import com.tripmates.backend.common.types.MenuItem;
import com.tripmates.backend.utils.updateMe.command.AccountUpdateCommand;
import com.tripmates.backend.utils.updateMe.UpdateCommandFactory;
import com.tripmates.backend.common.service.storage.StorageService;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Arrays;
import java.util.AbstractMap;

@Schema(description = "User update request DTO")
public record AccountUpdateRequestDTO(@Schema(description = "Account's name") String name,
		@Schema(description = "Account's description or bio") String description,
		@Schema(description = "Account's location") Location location,
		@Schema(description = "Account's phone number") String phoneNumber,
		@Schema(description = "Account's public email") @Email(
				message = ValidationErrorMessage.INVALID_EMAIL) String publicEmail,
		@Schema(description = "Business account's average price") AveragePrice averagePrice,
		@Schema(description = "Restaurant's type (for bussines account that is restaurant)") RestaurantType restaurantType,
		@Schema(description = "Restaurant's attention schedule") AttentionSchedule attentionSchedule,
		@Schema(description = "Restaurant's opening days") List<DayOfWeek> openingDays,
		@Schema(description = "Restaurant's menu") List<MenuItem> menu,
		@Schema(description = "Hotel's type") HotelType hotelType,
		@Schema(description = "Business account's images URL's to delete from profile photos collection") List<String> imageUrlsToDelete) {

	public List<AccountUpdateCommand> toCommands(StorageService storageService) {
		UpdateCommandFactory updateCommandFactory = new UpdateCommandFactory(storageService);
		return Arrays.stream(this.getClass().getRecordComponents()).map(rc -> {
			try {
				Object value = rc.getAccessor().invoke(this);
				return new AbstractMap.SimpleEntry<>(rc.getName(), value);
			}
			catch (ReflectiveOperationException e) {
				throw new RuntimeException(e);
			}
		})
			.filter(entry -> entry.getValue() != null)
			.map(entry -> updateCommandFactory.createCommand(entry.getKey(), entry.getValue()))
			.toList();
	}

}
