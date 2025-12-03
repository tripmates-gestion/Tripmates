package com.tripmates.backend.benchmarks.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;

import com.tripmates.backend.common.types.BenchmarkId;

import static org.springframework.data.mongodb.core.query.Criteria.where;

@Repository
public class BenchmarkRepositoryImpl implements BenchmarkRepositoryCustom {

	@Autowired
	private MongoTemplate mongoTemplate;

	@Override
	public int updateVisibility(String userId, BenchmarkId benchmarkId, boolean visible) {
		Query query = new Query(where("userId").is(userId).and("benchmarkId").is(benchmarkId));
		Update update = new Update().set("isVisible", visible);

		return (int) mongoTemplate.updateFirst(query, update, "benchmark_progress").getModifiedCount();
	}

}
