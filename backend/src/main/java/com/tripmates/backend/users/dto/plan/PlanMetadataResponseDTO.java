package com.tripmates.backend.users.dto.plan;

import java.util.List;


import io.swagger.v3.oas.annotations.media.Schema;

public record PlanMetadataResponseDTO(@Schema(description = "Plan's name") String name,
		@Schema(description = "Plan's description") String description,
		@Schema(description = "Plan's owner ID") String ownerId,
    @Schema(description="Plan's collaborators IDs") List<String> collaboratorsIds) {
}
