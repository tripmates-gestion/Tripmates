package com.tripmates.backend.users.dto;

import com.tripmates.backend.common.types.Plan;
import io.swagger.v3.oas.annotations.media.Schema;

public record PlanResumeResponseDTO(
        @Schema(description = "Account's ID") String id,
        @Schema(description = "Plan's name") String name,
        @Schema(description = "Plan's description") String description
) {
    /**
     * Retorna un resumen del plan.
     * @param plan información a resumir del plan.
     * @return {@link PlanResumeResponseDTO}.
     */
    public static PlanResumeResponseDTO fromPlan(Plan plan) {
        return new PlanResumeResponseDTO(plan.getId(), plan.getName(), plan.getDescription());
    }
}
