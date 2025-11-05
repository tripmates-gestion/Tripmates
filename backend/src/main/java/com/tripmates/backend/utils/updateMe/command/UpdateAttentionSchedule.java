package com.tripmates.backend.utils.updateMe.command;

import com.tripmates.backend.users.entity.mongo.Account;
import com.tripmates.backend.common.types.AttentionSchedule;
import com.tripmates.backend.common.types.Role;
import com.tripmates.backend.common.exception.BadRequestException;
import com.tripmates.backend.common.constants.ValidationErrorMessage;
import com.tripmates.backend.common.types.BusinessType;

public class UpdateAttentionSchedule implements AccountUpdateCommand {

	private final AttentionSchedule attentionSchedule;

	public UpdateAttentionSchedule(AttentionSchedule attentionSchedule) {
		this.attentionSchedule = attentionSchedule;
	}

	@Override
	public Account apply(Account account) {
		if (account.getRole() != Role.BUSINESS) {
			throw new BadRequestException(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT);
		}
		if (account.getBusinessType() != BusinessType.RESTAURANT) {
			throw new BadRequestException(ValidationErrorMessage.NOT_RESTAURANT_ACCOUNT);
		}
		account.setAttentionSchedule(attentionSchedule);
		return account;
	}

}
