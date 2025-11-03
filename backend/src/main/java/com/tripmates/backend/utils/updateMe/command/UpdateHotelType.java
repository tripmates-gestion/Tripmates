package com.tripmates.backend.utils.updateMe.command;

import com.tripmates.backend.common.types.HotelType;
import com.tripmates.backend.users.entity.mongo.Account;
import com.tripmates.backend.common.types.Role;
import com.tripmates.backend.common.types.BusinessType;
import com.tripmates.backend.common.exception.BadRequestException;
import com.tripmates.backend.common.constants.ValidationErrorMessage;

public class UpdateHotelType implements AccountUpdateCommand {

	private final HotelType hotelType;

	public UpdateHotelType(HotelType hotelType) {
		this.hotelType = hotelType;
	}

	@Override
	public Account apply(Account account) {
		if (account.getRole() != Role.BUSINESS) {
			throw new BadRequestException(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT);
		}
		if (account.getBusinessType() != BusinessType.HOTEL) {
			throw new BadRequestException(ValidationErrorMessage.NOT_HOTEL_ACCOUNT);
		}
		account.setHotelType(hotelType);
		return account;
	}

}
