package com.tripmates.backend.users.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

public record PlanUpdateRequestDTO(@Schema(description = "Plan's name") String name,
		@Schema(description = "Plan's description") String description,
		@Schema(description = "Plan's publications to append") List<String> publicationsIdList,
		@Schema(description = "0-based indexes of publications to remove from the plan") List<Integer> deletePublicationIndexes) {
}
