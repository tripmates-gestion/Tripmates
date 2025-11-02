package com.tripmates.backend.utils.updateMe.command;

import com.tripmates.backend.common.constants.ValidationErrorMessage;
import com.tripmates.backend.common.exception.BadRequestException;
import com.tripmates.backend.users.entity.Role;
import com.tripmates.backend.users.entity.mongo.Account;

public class UpdatePhoneNumber implements AccountUpdateCommand {

	private final String phoneNumber;

	public UpdatePhoneNumber(String phoneNumber) {
		this.phoneNumber = phoneNumber;
	}

	@Override
	public Account apply(Account account) {
		if (account.getRole() != Role.BUSINESS) {
			throw new BadRequestException(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT);
		}
		account.setPhoneNumber(phoneNumber);
		return account;
	}

}
