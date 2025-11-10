package com.tripmates.backend.users.dto;

import java.util.List;

public record FollowingsListResponseDTO(List<AccountResumeResponseDTO> followings) {
}
