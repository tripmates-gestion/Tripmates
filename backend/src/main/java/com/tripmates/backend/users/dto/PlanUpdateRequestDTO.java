package com.tripmates.backend.users.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

public record PlanUpdateRequestDTO(@Schema(description = "Plan's name") String name,
		@Schema(description = "Plan's description") String description,
		@Schema(description = "Plan's publications") List<String> publicationsIdList) {
}
