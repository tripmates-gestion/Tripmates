package com.tripmates.backend.publications.dto;

import java.util.List;
import java.time.DayOfWeek;
import java.time.LocalDate;

import com.tripmates.backend.common.types.AttentionSchedule;
import java.util.Date;
import com.tripmates.backend.publications.entity.mongo.Publication;

public record BusinessPublicationResponseDTO(
    String id,
    String title,
    String description,
    List<DayOfWeek> openingDays,
    AttentionSchedule attentionSchedule,
    List<LocalDate> exceptionalClosingDays,
    String phoneNumber,
    String email,
    String location,
    List<String> imageUrls,
    List<String> tags,

    String ownerId,
    String ownerUsername,
    String ownerAvatarUrl,

    Date createdAt) {
  public static BusinessPublicationResponseDTO fromPublication(Publication publication) {
    return new BusinessPublicationResponseDTO(
        publication.getId(),
        publication.getTitle(),
        publication.getDescription(),
        publication.getOpeningDays(),
        publication.getAttentionSchedule(),
        publication.getExceptionalClosingDays(),
        publication.getPhoneNumber(),
        publication.getEmail(),
        publication.getLocation(),
        publication.getImageUrls(),
        publication.getTags(),
        publication.getOwnerId(),
        publication.getOwnerUsername(),
        publication.getOwnerAvatarUrl(),
        publication.getCreatedAt());
  }
}
