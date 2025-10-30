package com.tripmates.backend.utils.updateMe.command;

import com.tripmates.backend.users.entity.mongo.Account;

public class UpdateName implements AccountUpdateCommand {

    private final String newName;

    public UpdateName(String newName) {
        this.newName = newName;
    }

    @Override
    public Account apply(Account account) {
        account.setName(newName);
        return account;
    }

}