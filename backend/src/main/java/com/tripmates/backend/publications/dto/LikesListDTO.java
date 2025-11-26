package com.tripmates.backend.publications.dto;

import java.util.List;

import com.tripmates.backend.users.dto.account.AccountResumeResponseDTO;

import io.swagger.v3.oas.annotations.media.Schema;

public record LikesListDTO(@Schema(description = "User account information") List<AccountResumeResponseDTO> likes) {
}
