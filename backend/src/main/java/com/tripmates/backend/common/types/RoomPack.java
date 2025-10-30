package com.tripmates.backend.common.types;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.util.List;

public record RoomPack(
                @JsonFormat(pattern = "yyyy-MM-dd") LocalDate checkInDate,
                @JsonFormat(pattern = "yyyy-MM-dd") LocalDate checkOutDate,
                Integer numberOfGuests,
                List<String> services,
                Float price,
                String description,
                List<String> photosURLs

) {
}
