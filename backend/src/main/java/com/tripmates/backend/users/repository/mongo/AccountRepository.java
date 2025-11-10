package com.tripmates.backend.users.repository.mongo;

import com.tripmates.backend.users.entity.mongo.Account;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;
import org.springframework.data.mongodb.repository.Query;

public interface AccountRepository extends MongoRepository<Account, String>, AccountRepositoryCustom {

	/**
	 * Returns a user account from its email.
	 * @param email user's email.
	 * @return {@link Account}.
	 */
	Optional<Account> findByEmail(String email);

	/**
	 * Checks if a user is following another user.
	 * @param followerUserId The ID of the follower
	 * @param followedUserId The ID of the user being followed
	 * @return true if the account is following the user, false otherwise
	 */
	@Query(value = "{ '_id' : ?0, 'followings' : ?1 }", count = true)
	long existsFollowing(String followerUserId, String followedUserId);

	/**
	 * Checks if a user has a specific follower.
	 * @param followerUserId The ID of the follower
	 * @param followedUserId The ID of the user being followed
	 * @return true if the account has the specified follower, false otherwise
	 */
	@Query(value = "{ '_id' : ?0, 'followers' : ?1 }", count = true)
	long existsFollowers(String followedUserId, String followerUserId);

}
