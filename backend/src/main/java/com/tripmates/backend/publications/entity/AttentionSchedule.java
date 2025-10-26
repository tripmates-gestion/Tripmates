package com.tripmates.backend.publications.entity;

import java.time.LocalTime;

public record AttentionSchedule(
    LocalTime openingTime,
    LocalTime closingTime
) {}