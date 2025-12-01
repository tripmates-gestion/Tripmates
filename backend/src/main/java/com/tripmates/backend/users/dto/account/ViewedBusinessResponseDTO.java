package com.tripmates.backend.users.dto.account;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.Date;

public record ViewedBusinessResponseDTO(@Schema(
		description = "Business's account resume response DTO") AccountResumeResponseDTO accountResumeResponseDTO,
		@Schema(description = "Date the publication was viewed") @JsonFormat(shape = JsonFormat.Shape.STRING,
				pattern = "yyyy-MM-dd HH:mm:ss") Date date) {
}
