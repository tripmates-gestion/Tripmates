package com.tripmates.backend.users.dto;

import java.util.List;

public record FollowersListResponseDTO(List<AccountResumeResponseDTO> followers) {
}
