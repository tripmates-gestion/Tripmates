package com.tripmates.backend.utils.updateMe.command;

import com.tripmates.backend.users.entity.mongo.Account;

public class UpdateDescription implements AccountUpdateCommand {

	private final String newDescription;

	public UpdateDescription(String newDescription) {
		this.newDescription = newDescription;
	}

	@Override
	public Account apply(Account account) {
		account.setDescription(newDescription);
		return account;
	}

}
