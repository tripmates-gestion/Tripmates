package com.tripmates.backend.utils.updateMe;

import com.tripmates.backend.common.types.HotelType;
import com.tripmates.backend.common.types.RestaurantType;
import com.tripmates.backend.utils.updateMe.command.AccountUpdateCommand;
import com.tripmates.backend.utils.updateMe.command.UpdateDescription;
import com.tripmates.backend.utils.updateMe.command.UpdateName;
import com.tripmates.backend.utils.updateMe.command.UpdateRestaurantType;
import com.tripmates.backend.utils.updateMe.command.UpdateHotelType;
import com.tripmates.backend.utils.updateMe.command.UpdateLocation;
import com.tripmates.backend.utils.updateMe.command.UpdatePhoneNumber;
import com.tripmates.backend.utils.updateMe.command.UpdatePublicEmail;
import com.tripmates.backend.utils.updateMe.command.UpdateAveragePrice;
import com.tripmates.backend.utils.updateMe.command.UpdateAttentionSchedule;
import com.tripmates.backend.utils.updateMe.command.UpdateOpeningDays;
import com.tripmates.backend.utils.updateMe.command.UpdateMenu;
import com.tripmates.backend.utils.updateMe.command.UpdateRoomPacks;
import com.tripmates.backend.utils.updateMe.command.DeletePhotosUrls;
import com.tripmates.backend.common.constants.ValidationErrorMessage;
import com.tripmates.backend.common.types.AttentionSchedule;
import com.tripmates.backend.common.types.AveragePrice;
import com.tripmates.backend.common.types.MenuItem;
import com.tripmates.backend.common.types.RoomPack;
import java.util.List;

import com.tripmates.backend.common.exception.BadRequestException;
import com.tripmates.backend.common.service.storage.StorageService;

import java.time.DayOfWeek;

public class UpdateCommandFactory {

	private final StorageService storageService;

	public UpdateCommandFactory(StorageService storageService) {
		this.storageService = storageService;
	}

	public AccountUpdateCommand createCommand(String fieldName, Object value) {
		return switch (fieldName) {
			case "name" -> new UpdateName((String) value);
			case "description" -> new UpdateDescription((String) value);
			case "restaurantType" -> new UpdateRestaurantType((RestaurantType) value);
			case "hotelType" -> new UpdateHotelType((HotelType) value);
			case "location" -> new UpdateLocation((String) value);
			case "phoneNumber" -> new UpdatePhoneNumber((String) value);
			case "publicEmail" -> new UpdatePublicEmail((String) value);
			case "averagePrice" -> new UpdateAveragePrice((AveragePrice) value);
			case "attentionSchedule" -> new UpdateAttentionSchedule((AttentionSchedule) value);
			case "openingDays" -> {
				parseAndValidateList(value, DayOfWeek.class);
				@SuppressWarnings("unchecked")
				List<DayOfWeek> daysOfWeek = (List<DayOfWeek>) value;
				yield new UpdateOpeningDays(daysOfWeek);
			}
			case "menu" -> {
				parseAndValidateList(value, MenuItem.class);
				@SuppressWarnings("unchecked")
				List<MenuItem> menu = (List<MenuItem>) value;
				yield new UpdateMenu(menu);
			}
			case "roomPacks" -> {
				parseAndValidateList(value, RoomPack.class);
				@SuppressWarnings("unchecked")
				List<RoomPack> packs = (List<RoomPack>) value;
				yield new UpdateRoomPacks(packs);
			}
			case "imageUrlsToDelete" -> {
				parseAndValidateList(value, String.class);
				@SuppressWarnings("unchecked")
				List<String> imageUrls = (List<String>) value;
				yield new DeletePhotosUrls(imageUrls, storageService);
			}
			default -> throw new IllegalArgumentException("Unknown field: " + fieldName);
		};
	}

	private static <T> void parseAndValidateList(Object value, Class<T> clazz) {
		if (!(value instanceof List<?> list) || (!list.isEmpty() && !clazz.isInstance(list.get(0))))
			throw new BadRequestException(ValidationErrorMessage.NOT_VALID_DAY);
	}

}