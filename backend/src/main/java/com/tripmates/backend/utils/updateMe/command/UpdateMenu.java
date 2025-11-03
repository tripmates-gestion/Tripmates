package com.tripmates.backend.utils.updateMe.command;

import com.tripmates.backend.common.constants.ValidationErrorMessage;
import com.tripmates.backend.common.exception.BadRequestException;
import com.tripmates.backend.common.types.BusinessType;
import com.tripmates.backend.common.types.MenuItem;
import com.tripmates.backend.common.types.Role;
import com.tripmates.backend.users.entity.mongo.Account;
import java.util.List;

public class UpdateMenu implements AccountUpdateCommand {

	private final List<MenuItem> menu;

	public UpdateMenu(List<MenuItem> menu) {
		this.menu = menu;
	}

	@Override
	public Account apply(Account account) {
		if (account.getRole() != Role.BUSINESS) {
			throw new BadRequestException(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT);
		}
		if (account.getBusinessType() != BusinessType.RESTAURANT) {
			throw new BadRequestException(ValidationErrorMessage.NOT_RESTAURANT_ACCOUNT);
		}
		account.setMenu(menu);
		return account;
	}

}
