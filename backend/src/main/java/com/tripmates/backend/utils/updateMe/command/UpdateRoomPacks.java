package com.tripmates.backend.utils.updateMe.command;

import com.tripmates.backend.common.constants.ValidationErrorMessage;
import com.tripmates.backend.common.exception.BadRequestException;
import com.tripmates.backend.common.types.BusinessType;
import com.tripmates.backend.common.types.Role;
import com.tripmates.backend.common.types.RoomPack;
import com.tripmates.backend.users.entity.mongo.Account;
import java.util.List;

public class UpdateRoomPacks implements AccountUpdateCommand {

    private final List<RoomPack> roomPacks;

    public UpdateRoomPacks(List<RoomPack> roomPacks) {
        this.roomPacks = roomPacks;
    }

    @Override
    public Account apply(Account account) {
        if (account.getRole() != Role.BUSINESS) {
            throw new BadRequestException(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT);
        }
        if (account.getBusinessType() != BusinessType.HOTEL) {
            throw new BadRequestException(ValidationErrorMessage.NOT_HOTEL_ACCOUNT);
        }
        account.setRoomPacks(roomPacks);
        return account;
    }
}
