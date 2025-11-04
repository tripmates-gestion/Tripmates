package com.tripmates.backend.publications.repository.mongo;

import java.util.List;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Repository;

import com.tripmates.backend.common.types.Review;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class ReviewRespositoryImpl implements ReviewRepository {

	private final MongoTemplate mongoTemplate;

	@Override
	public List<Review> findByOwnerId(String ownerId) {
		Aggregation agg = Aggregation.newAggregation(Aggregation.unwind("reviews"),
				Aggregation.match(Criteria.where("reviews.ownerId").is(ownerId)), Aggregation.replaceRoot("reviews"));

		AggregationResults<Review> results = mongoTemplate.aggregate(agg, "publications", Review.class);

		return results.getMappedResults();
	}

}
