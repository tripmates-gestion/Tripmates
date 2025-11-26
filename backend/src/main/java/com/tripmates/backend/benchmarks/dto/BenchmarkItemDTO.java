package com.tripmates.backend.benchmarks.dto;

import com.tripmates.backend.benchmarks.entity.BenchmarkProgress;
import com.tripmates.backend.common.types.BenchmarkId;

public record BenchmarkItemDTO(BenchmarkId id, Boolean visible) {
	public static BenchmarkItemDTO from(BenchmarkProgress progress) {
		return new BenchmarkItemDTO(progress.getBenchmarkId(), progress.getIsVisible());
	}
}
