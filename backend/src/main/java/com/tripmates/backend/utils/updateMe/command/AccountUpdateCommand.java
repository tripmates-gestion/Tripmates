package com.tripmates.backend.utils.updateMe.command;

import com.tripmates.backend.users.entity.mongo.Account;

public interface AccountUpdateCommand {

	Account apply(Account account);

}