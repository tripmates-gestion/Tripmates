package com.tripmates.backend.users.dto.followers;

import java.util.List;

import com.tripmates.backend.users.dto.account.AccountResumeResponseDTO;

public record FollowersListResponseDTO(List<AccountResumeResponseDTO> followers) {
}
