package com.tripmates.backend.benchmarks.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.beans.factory.annotation.Autowired;
import com.tripmates.backend.benchmarks.dto.ChangeBenchmarkVisibilityRequestDTO;
import com.tripmates.backend.benchmarks.service.BenchmarkService;

@RestController
@RequestMapping("/benchmarks")
public class BenchmarksController {

	@Autowired
	private BenchmarkService benchmarkService;

	@GetMapping("/mine")
	public ResponseEntity<?> getBenchmarks(@AuthenticationPrincipal UserDetails userDetails) {

		return ResponseEntity.ok().body(benchmarkService.getMyBenchmarks(userDetails.getUsername()));
	}

	@PatchMapping("/mine")
	public ResponseEntity<?> updateBenchmarkVisibility(@AuthenticationPrincipal UserDetails userDetails,
			@RequestBody ChangeBenchmarkVisibilityRequestDTO updateRequest) {
		return ResponseEntity.ok()
			.body(benchmarkService.updateBenchmarkVisibility(updateRequest.updates(), userDetails.getUsername()));
	}

	@GetMapping("/user/{userId}") // publicos public ResponseEntity<?>
	public ResponseEntity<?> getAllBenchmarks(@PathVariable String userId) {
		return ResponseEntity.ok().body(benchmarkService.getPublicBenchmarks(userId));
	}

}