package com.tripmates.backend.utils.updateMe.command;

import com.tripmates.backend.users.entity.mongo.Account;

public class UpdatePublicEmail implements AccountUpdateCommand {

    private final String publicEmail;

    public UpdatePublicEmail(String publicEmail) {
        this.publicEmail = publicEmail;
    }

    @Override
    public Account apply(Account account) {
        account.setPublicEmail(publicEmail);
        return account;
    }
}
