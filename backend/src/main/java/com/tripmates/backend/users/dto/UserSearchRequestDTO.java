package com.tripmates.backend.users.dto;

import com.tripmates.backend.common.types.BusinessType;
import com.tripmates.backend.users.entity.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.validation.annotation.Validated;

@Validated
public record UserSearchRequestDTO(@Schema(description = "User's role type") Role role,
		@Schema(description = "User's location") String location,
		@Schema(description = "User's business type") BusinessType businessType) {
}
