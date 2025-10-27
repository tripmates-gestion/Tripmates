package com.tripmates.backend.publications.dto;

import java.util.List;
import java.time.DayOfWeek;
import java.time.LocalDate;
import com.tripmates.backend.publications.entity.AttentionSchedule;
import com.tripmates.backend.publications.entity.BusinessType;
import java.util.Date;
import com.tripmates.backend.publications.entity.mongo.Publication;

public record BusinessPublicationResponseDTO (
    String title,
    BusinessType type, // esto se obtiene a partir del User no de la Publication
    String description,
    List<DayOfWeek> openingDays,
    AttentionSchedule attentionSchedule,
    List<LocalDate> exceptionalClosingDays,
    String phoneNumber,
    String email,
    String location,
    List<String> imageUrls,

    String ownerId,
    String ownerUsername,
    String ownerAvatarUrl,

    Date createdAt
) {
  public static BusinessPublicationResponseDTO fromPublication(Publication publication) {
    return new BusinessPublicationResponseDTO(
        publication.getTitle(),
        publication.getType(),
        publication.getDescription(),
        publication.getOpeningDays(),
        publication.getAttentionSchedule(),
        publication.getExceptionalClosingDays(),
        publication.getPhoneNumber(),
        publication.getEmail(),
        publication.getLocation(),
        publication.getImageUrls(),

        publication.getOwnerId(),
        publication.getOwnerUsername(),
        publication.getOwnerAvatarUrl(),
        
        publication.getCreatedAt()
    );
  }
}
