package com.tripmates.backend.users.repository.mongo;

import com.tripmates.backend.common.types.BusinessType;
import com.tripmates.backend.users.entity.Role;
import com.tripmates.backend.users.entity.mongo.Account;
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
public class UserRepositoryCustomImpl implements UserRepositoryCustom {

	@Autowired
	private MongoTemplate mongoTemplate;

	@Override
	public Page<Account> searchUsers(String username, Role role, String location, BusinessType businessType,
			Pageable pageable) {
		Query query = new Query();
		List<Criteria> criteriaList = new ArrayList<>();

		if (username != null)
			criteriaList.add(Criteria.where("name").is(username));

		if (role != null)
			criteriaList.add(Criteria.where("role").is(role));

		if (location != null)
			criteriaList.add(Criteria.where("location").is(location));

		if (businessType != null)
			criteriaList.add(Criteria.where("businessType").is(businessType));

		if (!criteriaList.isEmpty())
			query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));

		long total = mongoTemplate.count(query, Account.class);
		query.with(pageable);

		return new PageImpl<>(mongoTemplate.find(query, Account.class), pageable, total);
	}

}
