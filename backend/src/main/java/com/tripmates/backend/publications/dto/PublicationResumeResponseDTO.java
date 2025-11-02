package com.tripmates.backend.publications.dto;

import java.util.List;
import java.time.DayOfWeek;
import java.time.LocalDate;

import com.tripmates.backend.common.types.AttentionSchedule;
import java.util.Date;
import com.tripmates.backend.publications.entity.mongo.Publication;
import io.swagger.v3.oas.annotations.media.Schema;

public record PublicationResumeResponseDTO(@Schema(description = "Publication's ID") String id,
		@Schema(description = "Publication's title") String title,
		@Schema(description = "Publication's description") String description,
		@Schema(description = "Publication's opening days") List<DayOfWeek> openingDays,
		@Schema(description = "Publication's attention schedule") AttentionSchedule attentionSchedule,
		@Schema(description = "Publication's exceptional closing days") List<LocalDate> exceptionalClosingDays,
		@Schema(description = "Publication's images URLs") List<String> imageUrls,
		@Schema(description = "Publication's tags") List<String> tags,
		@Schema(description = "Publication's creation date") Date createdAt,
		@Schema(description = "Business's phone number") String phoneNumber,
		@Schema(description = "Business's email") String email,
		@Schema(description = "Business's location") String location,
		@Schema(description = "Business's ID") String ownerId,
		@Schema(description = "Business's username") String ownerUsername,
		@Schema(description = "Business's avatar URL") String ownerAvatarUrl) {
	public static PublicationResumeResponseDTO fromPublication(Publication publication) {
		return new PublicationResumeResponseDTO(publication.getId(), publication.getTitle(),
				publication.getDescription(), publication.getOpeningDays(), publication.getAttentionSchedule(),
				publication.getExceptionalClosingDays(), publication.getImageUrls(), publication.getTags(),
				publication.getCreatedAt(), publication.getPhoneNumber(), publication.getEmail(),
				publication.getLocation(), publication.getOwnerId(), publication.getOwnerUsername(),
				publication.getOwnerAvatarUrl());
	}
}
