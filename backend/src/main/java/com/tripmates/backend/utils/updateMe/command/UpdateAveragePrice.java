package com.tripmates.backend.utils.updateMe.command;

import com.tripmates.backend.users.entity.mongo.Account;
import com.tripmates.backend.common.types.AveragePrice;
import com.tripmates.backend.common.exception.BadRequestException;
import com.tripmates.backend.common.types.Role;
import com.tripmates.backend.common.constants.ValidationErrorMessage;

public class UpdateAveragePrice implements AccountUpdateCommand {

	private final AveragePrice averagePrice;

	public UpdateAveragePrice(AveragePrice averagePrice) {
		this.averagePrice = averagePrice;
	}

	@Override
	public Account apply(Account account) {
		if (account.getRole() != Role.BUSINESS) {
			throw new BadRequestException(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT);
		}
		account.setAveragePrice(averagePrice);
		return account;
	}

}
