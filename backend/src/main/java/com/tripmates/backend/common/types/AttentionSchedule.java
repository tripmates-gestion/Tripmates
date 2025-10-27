package com.tripmates.backend.common.types;

import java.time.LocalTime;

public record AttentionSchedule(
    LocalTime openingTime,
    LocalTime closingTime
) {}