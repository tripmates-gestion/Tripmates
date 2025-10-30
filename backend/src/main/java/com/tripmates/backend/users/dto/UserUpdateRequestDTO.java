package com.tripmates.backend.users.dto;

import com.tripmates.backend.common.types.AttentionSchedule;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import com.tripmates.backend.common.constants.ValidationErrorMessage;
import java.time.DayOfWeek;
import com.tripmates.backend.common.types.AveragePrice;
import java.util.List;
import com.tripmates.backend.common.types.MenuItem;

@Schema(description = "User update request DTO")
public record UserUpdateRequestDTO(
		@Schema(description = "Account's name") String name,
		@Schema(description = "Account's description or bio") String description,
		@Schema(description = "Account's location") String location,
		@Schema(description = "Account's phone number") String phoneNumber,
		@Schema(description = "Account's public email") @Email(message = ValidationErrorMessage.INVALID_EMAIL) String publicEmail,
		@Schema(description = "Business account's average price") AveragePrice averagePrice,
		@Schema(description = "Restaurant's type (for bussines account that is restaurant)") String restaurantType,
		@Schema(description = "Restaurant's attention schedule") AttentionSchedule attentionSchedule,
		@Schema(description = "Restaurant's opening days") List<DayOfWeek> openingDays,
		@Schema(description = "Restaurant's menu") List<MenuItem> menu,
		@Schema(description = "Hotel's type") String hotelType) {
}
