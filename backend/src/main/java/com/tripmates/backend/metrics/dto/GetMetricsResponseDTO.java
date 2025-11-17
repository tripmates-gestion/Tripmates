package com.tripmates.backend.metrics.dto;

import com.tripmates.backend.common.types.EventReport;
public record GetMetricsResponseDTO
(
    EventReport reviewsFromMyPublications,
    EventReport profileViews,
    Integer totalLikes
){
}
