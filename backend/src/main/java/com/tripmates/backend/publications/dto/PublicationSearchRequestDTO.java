package com.tripmates.backend.publications.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.validation.annotation.Validated;
import java.util.List;

@Validated
public record PublicationSearchRequestDTO(@Schema(description = "Full-text search over title and description") String q,
		@Schema(description = "Publication location") String location,
		@Schema(description = "Tags that the publication must contain (all)") List<String> tags,
		@Schema(description = "Filter by owner id") String ownerId) {
}
