package com.tripmates.backend.benchmarks.entity;

import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import com.tripmates.backend.common.types.BenchmarkId;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Document(collection = "benchmark_progress")
@CompoundIndexes({
		@CompoundIndex(name = "user_benchmark_unique", def = "{'userId': 1, 'benchmarkId': 1}", unique = true) })
@Getter
@Setter
@NoArgsConstructor
public class BenchmarkProgress {

	private BenchmarkId benchmarkId;

	private Boolean isVisible;

	private String userId;

	public BenchmarkProgress(BenchmarkId benchmarkId, String userId) {
		this.benchmarkId = benchmarkId;
		this.isVisible = false;// by default
		this.userId = userId;
	}

}
