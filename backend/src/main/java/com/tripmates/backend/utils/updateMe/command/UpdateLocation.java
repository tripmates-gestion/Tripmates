package com.tripmates.backend.utils.updateMe.command;

import com.tripmates.backend.users.entity.mongo.Account;

public class UpdateLocation implements AccountUpdateCommand {

    private final String location;

    public UpdateLocation(String location) {
        this.location = location;
    }

    @Override
    public Account apply(Account account) {
        account.setLocation(location);
        return account;
    }
}
