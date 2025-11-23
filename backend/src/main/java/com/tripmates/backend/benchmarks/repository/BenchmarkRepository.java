package com.tripmates.backend.benchmarks.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.tripmates.backend.benchmarks.entity.BenchmarkProgress;

import java.util.Optional;
import com.tripmates.backend.common.types.BenchmarkId;

public interface BenchmarkRepository extends MongoRepository<BenchmarkProgress, String> {

	List<BenchmarkProgress> findByUserId(String userId);

	/**
	 * Finds a specific benchmark progress for a user.
	 * @param userId the user's ID
	 * @param benchmarkId the benchmark ID
	 * @return an Optional containing the benchmark progress if found
	 */
	Optional<BenchmarkProgress> findByUserIdAndBenchmarkId(String userId, BenchmarkId benchmarkId);

}
