package com.tripmates.backend.publications.repository.mongo;

import com.tripmates.backend.publications.dto.PublicationSearchRequestDTO;
import com.tripmates.backend.publications.entity.mongo.Publication;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

@Repository
public class PublicationRepositoryCustomImpl implements PublicationRepositoryCustom {

	@Autowired
	private MongoTemplate mongoTemplate;

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

}
