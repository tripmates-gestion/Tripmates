package com.tripmates.backend.users.dto.plan;

import com.tripmates.backend.common.types.Plan;
import com.tripmates.backend.publications.dto.PublicationResumeResponseDTO;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

public record PlanResumeResponseDTO(@Schema(description = "Account's ID") String id,
		@Schema(description = "Plan's name") String name,
		@Schema(description = "Plan's description") String description,
		@Schema(description = "") List<PublicationResumeResponseDTO> publications) {
	/**
	 * Retorna un resumen del plan.
	 * @param plan información a resumir del plan.
	 * @return {@link PlanResumeResponseDTO}.
	 */
	public static PlanResumeResponseDTO fromPlan(Plan plan,
			List<PublicationResumeResponseDTO> publicationResumeResponseDTOList) {
		return new PlanResumeResponseDTO(plan.getId(), plan.getName(), plan.getDescription(),
				publicationResumeResponseDTOList);
	}
}
