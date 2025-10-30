package com.tripmates.backend.utils.updateMe;

import com.tripmates.backend.utils.updateMe.command.AccountUpdateCommand;
import com.tripmates.backend.utils.updateMe.command.UpdateDescription;
import com.tripmates.backend.utils.updateMe.command.UpdateName;
import com.tripmates.backend.utils.updateMe.command.UpdateRestaurantType;
import com.tripmates.backend.utils.updateMe.command.UpdateHotelType;
import com.tripmates.backend.utils.updateMe.command.UpdateLocation;
import com.tripmates.backend.utils.updateMe.command.UpdatePhoneNumber;
import com.tripmates.backend.utils.updateMe.command.UpdatePublicEmail;
import com.tripmates.backend.utils.updateMe.command.UpdateAveragePrice;
import com.tripmates.backend.utils.updateMe.command.UpdateAttentionSchedule;
import com.tripmates.backend.utils.updateMe.command.UpdateOpeningDays;
import com.tripmates.backend.common.types.AttentionSchedule;
import com.tripmates.backend.common.types.AveragePrice;
import java.util.List;
import java.time.DayOfWeek;

public class UpdateCommandFactory {

    public static AccountUpdateCommand createCommand(String fieldName, Object value) {
        return switch (fieldName) {
            case "name" -> new UpdateName((String) value);
            case "description" -> new UpdateDescription((String) value);
            case "restaurantType" -> new UpdateRestaurantType((String) value);
            case "hotelType" -> new UpdateHotelType((String) value);
            case "location" -> new UpdateLocation((String) value);
            case "phoneNumber" -> new UpdatePhoneNumber((String) value);
            case "publicEmail" -> new UpdatePublicEmail((String) value);
            case "averagePrice" -> new UpdateAveragePrice((AveragePrice) value);
            case "attentionSchedule" -> new UpdateAttentionSchedule((AttentionSchedule) value);
            case "openingDays" -> {
                if (!(value instanceof List<?> list)) {
                    throw new IllegalArgumentException("openingDays must be a List");
                }
                if (!list.isEmpty() && !(list.get(0) instanceof DayOfWeek)) {
                    throw new IllegalArgumentException("All elements in openingDays must be of type DayOfWeek");
                }
                @SuppressWarnings("unchecked")
                List<DayOfWeek> daysOfWeek = (List<DayOfWeek>) value;
                yield new UpdateOpeningDays(daysOfWeek);
            }
            default -> throw new IllegalArgumentException("Unknown field: " + fieldName);
        };
    }
}