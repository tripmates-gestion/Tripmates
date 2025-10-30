package com.tripmates.backend.utils.updateMe.command;

import com.tripmates.backend.common.exception.BadRequestException;
import com.tripmates.backend.users.entity.mongo.Account;
import com.tripmates.backend.users.entity.Role;
import com.tripmates.backend.common.constants.ValidationErrorMessage;

public class UpdateRestaurantType implements AccountUpdateCommand {

    private final String restaurantType;

    public UpdateRestaurantType(String restaurantType) {
        this.restaurantType = restaurantType;
    }

    @Override
    public Account apply(Account account) {
        if (account.getRole() != Role.BUSINESS) {
            throw new BadRequestException(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT);
        }
        account.setRestaurantType(restaurantType);
        return account;
    }
}
