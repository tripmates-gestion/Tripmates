package com.tripmates.backend.benchmarks.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.beans.factory.annotation.Autowired;
import com.tripmates.backend.benchmarks.service.BenchmarkService;

@RestController
@RequestMapping("/benchmarks")
public class BenchmarksController {

	@Autowired
	private BenchmarkService benchmarkService;

	@GetMapping("/mine") // publicos y privados
	public ResponseEntity<?> getBenchmarks(@AuthenticationPrincipal UserDetails userDetails) {

		return ResponseEntity.ok().body(benchmarkService.getMyBenchmarks(userDetails.getUsername()));
	}

	/*
	 * @GetMapping("/{userId}") // publicos public ResponseEntity<?>
	 * getAllBenchmarks(@PathVariable String userId) { return ResponseEntity.ok().build();
	 * }
	 */

}