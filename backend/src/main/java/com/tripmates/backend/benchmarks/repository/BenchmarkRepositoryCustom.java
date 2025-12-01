package com.tripmates.backend.benchmarks.repository;

import com.tripmates.backend.common.types.BenchmarkId;

public interface BenchmarkRepositoryCustom {

	int updateVisibility(String userId, BenchmarkId benchmarkId, boolean visible);

}
