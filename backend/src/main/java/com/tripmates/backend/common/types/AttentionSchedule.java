package com.tripmates.backend.common.types;

import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonFormat;

public record AttentionSchedule(
    @JsonFormat(pattern = "HH:mm")
    LocalTime openingTime,
    
    @JsonFormat(pattern = "HH:mm")
    LocalTime closingTime
) {}