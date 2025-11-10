package com.tripmates.backend.users.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record UserSearchRequestDTO(@Schema(description = "Filter by user's username") String username,
		@Schema(description = "Filter by user's followers") Integer followers,
		@Schema(description = "Filter by user's followings") Integer followings,
		@Schema(description = "Filter by users's locations") String location) {
}
