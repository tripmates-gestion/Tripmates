package com.tripmates.backend.auth.repository.mongo;

import com.tripmates.backend.auth.entity.mongo.PasswordResetCode;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface PasswordResetCodeRepository extends MongoRepository<PasswordResetCode, String> {

	/**
	 * Finds the most recent password reset code for an email that hasn't been used.
	 * @param email user's email.
	 * @param used whether the code has been used.
	 * @return {@link PasswordResetCode}.
	 */
	Optional<PasswordResetCode> findFirstByEmailAndUsedOrderByCreatedAtDesc(String email, boolean used);

	/**
	 * Finds a password reset code by email and code that hasn't been used.
	 * @param email user's email.
	 * @param code reset code.
	 * @param used whether the code has been used.
	 * @return {@link PasswordResetCode}.
	 */
	Optional<PasswordResetCode> findByEmailAndCodeAndUsed(String email, String code, boolean used);

}
