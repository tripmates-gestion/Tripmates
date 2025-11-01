package com.tripmates.backend.utils.updateMe.command;

import com.tripmates.backend.common.exception.BadRequestException;
import com.tripmates.backend.common.types.BusinessType;
import com.tripmates.backend.common.types.RestaurantType;
import com.tripmates.backend.users.entity.mongo.Account;
import com.tripmates.backend.common.types.Role;
import com.tripmates.backend.common.constants.ValidationErrorMessage;

public class UpdateRestaurantType implements AccountUpdateCommand {

	private final RestaurantType restaurantType;

	public UpdateRestaurantType(RestaurantType restaurantType) {
		this.restaurantType = restaurantType;
	}

	@Override
	public Account apply(Account account) {
		if (account.getRole() != Role.BUSINESS) {
			throw new BadRequestException(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT);
		}
		if (account.getBusinessType() != BusinessType.RESTAURANT) {
			throw new BadRequestException(ValidationErrorMessage.NOT_RESTAURANT_ACCOUNT);
		}
		account.setRestaurantType(restaurantType);
		return account;
	}

}
