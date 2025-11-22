package com.tripmates.backend.publications.dto;

import java.util.List;

import com.tripmates.backend.users.dto.account.AccountResumeResponseDTO;

public record LikesListDTO(List<AccountResumeResponseDTO> likes) {
}
