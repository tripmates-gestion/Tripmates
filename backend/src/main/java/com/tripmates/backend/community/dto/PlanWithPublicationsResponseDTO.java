package com.tripmates.backend.community.dto;

import java.util.List;
import com.tripmates.backend.common.types.Plan;
import com.tripmates.backend.common.types.PlanMetadataWithContent;
import com.tripmates.backend.publications.dto.PublicationResumeResponseDTO;
import com.tripmates.backend.publications.repository.mongo.PublicationRepository;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.ArrayList;

public record PlanWithPublicationsResponseDTO(@Schema(description = "Plan's ID") String id,
		@Schema(description = "Plan's name") String name,
		@Schema(description = "Plan's description") String description,
		@Schema(description = "Plan's owner ID") String ownerId,
		@Schema(description = "Plan's collaborators IDs") List<String> collaboratorsIds,
		@Schema(description = "Plan's publications") List<PublicationResumeResponseDTO> publications) {
	public static PlanWithPublicationsResponseDTO fromPlan(Plan plan, PublicationRepository publicationRepository) {
		List<PublicationResumeResponseDTO> publications = new ArrayList<>();
		for (String publicationId : plan.getPublicationsIdList()) {
			PublicationResumeResponseDTO publicationResumeResponseDTO = publicationRepository.findById(publicationId)
				.map(PublicationResumeResponseDTO::fromPublication)
				.orElse(null);
			if (publicationResumeResponseDTO != null)
				publications.add(publicationResumeResponseDTO);
		}
		return new PlanWithPublicationsResponseDTO(plan.getId(), plan.getName(), plan.getDescription(),
				plan.getOwnerId(), new ArrayList<>(plan.getCollaboratorsUsersIds()), publications);
	}

	public static PlanWithPublicationsResponseDTO fromPlanMetadataWithContent(
			PlanMetadataWithContent planMetadataWithContent, PublicationRepository publicationRepository) {
		List<PublicationResumeResponseDTO> publications = new ArrayList<>();
		for (String publicationId : planMetadataWithContent.publicationsIds()) {
			PublicationResumeResponseDTO publicationResumeResponseDTO = publicationRepository.findById(publicationId)
				.map(PublicationResumeResponseDTO::fromPublication)
				.orElse(null);
			if (publicationResumeResponseDTO != null)
				publications.add(publicationResumeResponseDTO);
		}
		return new PlanWithPublicationsResponseDTO(planMetadataWithContent.planId(), planMetadataWithContent.name(),
				planMetadataWithContent.description(), planMetadataWithContent.ownerId(),
				new ArrayList<>(planMetadataWithContent.collaboratorsIds()), publications);
	}
}
