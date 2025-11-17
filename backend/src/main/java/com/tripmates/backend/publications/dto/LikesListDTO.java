package com.tripmates.backend.publications.dto;

import com.tripmates.backend.users.dto.AccountResumeResponseDTO;
import java.util.List;

public record LikesListDTO(List<AccountResumeResponseDTO> likes) {
}
