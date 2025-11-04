package com.tripmates.backend.utils;

import com.tripmates.backend.common.types.Plan;
import com.tripmates.backend.users.dto.PlanCreationRequestDTO;
import com.tripmates.backend.users.entity.mongo.Account;

import java.util.ArrayList;

public class PlanBuilder {

	/**
	 * Plan's builder specifications
	 */
	private PlanCreationRequestDTO planCreationRequestDTO;

	/**
	 * Plan's builder owner account.
	 */
	private Account owner;

	/**
	 * Sets in plan builder the plans specifications.
	 * @param planCreationRequestDTO DTO that contains plans specifications.
	 * @return {@link PlanBuilder}.
	 */
	public PlanBuilder planDetails(PlanCreationRequestDTO planCreationRequestDTO) {
		this.planCreationRequestDTO = planCreationRequestDTO;
		return this;
	}

	/**
	 * Sets in plan builder owner account.
	 * @param owner owner account.
	 * @return {@link PlanBuilder}.
	 */
	public PlanBuilder owner(Account owner) {
		this.owner = owner;
		return this;
	}

	/**
	 * Builds a plan based on the specifications and it's owner account.
	 * @return {@link Plan}.
	 */
	public Plan build() {
		return new Plan(owner.getId(), planCreationRequestDTO.name(), planCreationRequestDTO.description(),
				new ArrayList<>());
	}

}
