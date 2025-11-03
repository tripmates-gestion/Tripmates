package com.tripmates.backend.plans.service;

import com.tripmates.backend.plans.dto.PlanCreationRequestDTO;
import com.tripmates.backend.users.entity.mongo.Account;
import com.tripmates.backend.users.repository.mongo.AccountRespository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PlanService {

	@Autowired
	private AccountRespository accountRespository;

	public int createPlan(PlanCreationRequestDTO planCreationRequestDTO) {
		Account account = accountRespository.findById(planCreationRequestDTO.id()).orElseThrow();
		return 0;
	}

}
