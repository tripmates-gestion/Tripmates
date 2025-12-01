package com.tripmates.backend.users.dto.account;

import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.validation.annotation.Validated;

@Validated
public record SocialMediaUpdateRequestDTO(@Schema(description = "Instagram account link") String instagramURL,
		@Schema(description = "X account link") String xURL,
		@Schema(description = "Facebook account link") String facebookURL) {
}
