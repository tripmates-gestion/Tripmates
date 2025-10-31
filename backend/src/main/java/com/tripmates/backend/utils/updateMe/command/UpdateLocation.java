package com.tripmates.backend.utils.updateMe.command;

import com.tripmates.backend.common.exception.BadRequestException;
import com.tripmates.backend.common.constants.ValidationErrorMessage;
import com.tripmates.backend.users.entity.Role;
import com.tripmates.backend.users.entity.mongo.Account;

public class UpdateLocation implements AccountUpdateCommand {

    private final String location;

    public UpdateLocation(String location) {
        this.location = location;
    }

    @Override
    public Account apply(Account account) {
        if (account.getRole() != Role.BUSINESS) {
            throw new BadRequestException(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT);
        }
        account.setLocation(location);
        return account;
    }
}
