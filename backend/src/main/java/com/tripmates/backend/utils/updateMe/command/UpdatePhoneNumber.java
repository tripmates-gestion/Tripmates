package com.tripmates.backend.utils.updateMe.command;

import com.tripmates.backend.users.entity.mongo.Account;

public class UpdatePhoneNumber implements AccountUpdateCommand {

    private final String phoneNumber;

    public UpdatePhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    @Override
    public Account apply(Account account) {
        account.setPhoneNumber(phoneNumber);
        return account;
    }
}
