package com.tripmates.backend.users.repository.mongo;

import com.tripmates.backend.users.entity.mongo.Account;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface AccountRepository extends MongoRepository<Account, String>, AccountRepositoryCustom {

	/**
	 * Returns a user account from its email.
	 * @param email user's email.
	 * @return {@link Account}.
	 */
	Optional<Account> findByEmail(String email);

}
