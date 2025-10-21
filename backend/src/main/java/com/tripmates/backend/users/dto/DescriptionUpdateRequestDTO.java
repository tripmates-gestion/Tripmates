package com.tripmates.backend.users.dto;

import jakarta.validation.constraints.Size;

public record DescriptionUpdateRequestDTO(
        @Size(max = 500, message = "Description cannot exceed 500 characters")
        String description
) {}
