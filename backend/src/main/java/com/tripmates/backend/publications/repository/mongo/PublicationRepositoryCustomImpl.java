package com.tripmates.backend.publications.repository.mongo;

import com.tripmates.backend.common.types.Like;
import com.tripmates.backend.publications.dto.PublicationSearchRequestDTO;
import com.tripmates.backend.publications.entity.mongo.Publication;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.aggregation.ArrayOperators;

@Repository
public class PublicationRepositoryCustomImpl implements PublicationRepositoryCustom {

	@Autowired
	private MongoTemplate mongoTemplate;

	@Override
	public List<Date> findReviewDatesByBusinessIdAndDateRange(String businessId, Date startDate, Date endDate) {
		Aggregation aggregation = Aggregation.newAggregation(
				Aggregation.match(Criteria.where("ownerId").is(businessId)), Aggregation.unwind("reviews"),
				Aggregation.match(Criteria.where("reviews.date").gte(startDate).lte(endDate)),
				Aggregation.project().and("reviews.date").as("reviewDate")

		);

		AggregationResults<ReviewDateResult> results = mongoTemplate.aggregate(aggregation, "publications",
				ReviewDateResult.class);

		return results.getMappedResults().stream().map(ReviewDateResult::getReviewDate).collect(Collectors.toList());
	}

	@Override
	public Page<Publication> search(PublicationSearchRequestDTO filters, Pageable pageable) {
		Query query = new Query();
		List<Criteria> criteriaList = new ArrayList<>();

		if (filters != null) {
			if (filters.q() != null && !filters.q().isBlank()) {
				String q = Pattern.quote(filters.q().trim());
				criteriaList.add(new Criteria().orOperator(Criteria.where("title").regex(q, "i"),
						Criteria.where("description").regex(q, "i")));
			}

			if (filters.location() != null && !filters.location().isBlank()) {
				criteriaList.add(Criteria.where("location").regex(Pattern.quote(filters.location().trim()), "i"));
			}

			if (filters.tags() != null && !filters.tags().isEmpty()) {
				criteriaList.add(Criteria.where("tags").all(filters.tags()));
			}

			if (filters.ownerId() != null && !filters.ownerId().isBlank()) {
				criteriaList.add(Criteria.where("ownerId").is(filters.ownerId()));
			}
		}

		if (!criteriaList.isEmpty()) {
			query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
		}

		long total = mongoTemplate.count(query, Publication.class);
		query.with(pageable);
		List<Publication> results = mongoTemplate.find(query, Publication.class);
		return new PageImpl<>(results, pageable, total);
	}

	@Override
	public void addToLikes(String publicationId, String userId) {
		Query query = new Query(Criteria.where("_id").is(publicationId));
		Update update = new Update().addToSet("likes", new Like(userId, new Date()));

		mongoTemplate.updateFirst(query, update, Publication.class);
	}

	@Override
	public void removeFromLikes(String publicationId, String userId) {
		Query query = new Query(Criteria.where("_id").is(publicationId));

		Update update = new Update().pull("likes", Query.query(Criteria.where("userId").is(userId)));

		mongoTemplate.updateFirst(query, update, Publication.class);
	}

	@Override
	public Integer countLikesFromAccountId(String accountId) {
		Aggregation aggregation = Aggregation.newAggregation(Aggregation.match(Criteria.where("ownerId").is(accountId)),
				Aggregation.project().and(ArrayOperators.Size.lengthOfArray("likes")).as("likesCount"),
				Aggregation.group().sum("likesCount").as("totalLikes"));

		AggregationResults<Map> results = mongoTemplate.aggregate(aggregation, "publications", Map.class);

		if (results.getMappedResults().isEmpty())
			return 0;

		Object totalLikesObj = results.getMappedResults().getFirst().get("totalLikes");

		if (totalLikesObj instanceof Number)
			return ((Number) totalLikesObj).intValue();

		return 0;
	}

	@Data
	@NoArgsConstructor
	@AllArgsConstructor
	private static class ReviewDateResult {

		private Date reviewDate;

	}

}
