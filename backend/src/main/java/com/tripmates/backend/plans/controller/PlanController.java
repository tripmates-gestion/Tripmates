package com.tripmates.backend.plans.controller;

import com.tripmates.backend.plans.dto.PlanCreationRequestDTO;
import com.tripmates.backend.plans.service.PlanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/plans")
@Tag(name = "Plans", description = "Plans management endpoints")
public class PlanController {

	private final PlanService planService;

	public PlanController(PlanService planService) {
		this.planService = planService;
	}

	@PostMapping("/create")
	@Operation(description = "Creates a user plan")
	@ApiResponses(value = { @ApiResponse(responseCode = "200", description = "Plan created successfully") })
	public ResponseEntity<?> create(@RequestBody PlanCreationRequestDTO planCreationRequestDTO) {
		return ResponseEntity.ok(planService.createPlan(planCreationRequestDTO));
	}

}
