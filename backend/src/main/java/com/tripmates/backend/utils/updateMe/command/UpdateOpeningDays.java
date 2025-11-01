package com.tripmates.backend.utils.updateMe.command;

import com.tripmates.backend.users.entity.mongo.Account;
import com.tripmates.backend.users.entity.Role;
import com.tripmates.backend.common.types.BusinessType;
import com.tripmates.backend.common.exception.BadRequestException;
import com.tripmates.backend.common.constants.ValidationErrorMessage;
import java.time.DayOfWeek;
import java.util.List;

public class UpdateOpeningDays implements AccountUpdateCommand {

	private final List<DayOfWeek> openingDays;

	public UpdateOpeningDays(List<DayOfWeek> openingDays) {
		this.openingDays = openingDays;
	}

	@Override
	public Account apply(Account account) {
		if (account.getRole() != Role.BUSINESS) {
			throw new BadRequestException(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT);
		}
		if (account.getBusinessType() != BusinessType.RESTAURANT) {
			throw new BadRequestException(ValidationErrorMessage.NOT_RESTAURANT_ACCOUNT);
		}
		account.setOpeningDays(openingDays);
		return account;
	}

}
