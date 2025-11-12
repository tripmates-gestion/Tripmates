package com.tripmates.backend.users.repository.mongo;

import com.tripmates.backend.users.dto.AccountSearchRequestDTO;
import com.tripmates.backend.users.entity.mongo.Account;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AccountRepositoryCustom {

	/**
	 * Returns all users accounts that match the filter, if there are no filters then it
	 * returns all the users accounts.
	 * @param accountSearchRequestDTO DTO with the filters.
	 * @param pageable page configuration.
	 * @return a page of {@link Account}.
	 */
	Page<Account> searchAccount(AccountSearchRequestDTO accountSearchRequestDTO, Pageable pageable);

	void addToFollowings(String accountId, String userIdToFollow);

	void removeFromFollowings(String accountId, String userIdToUnfollow);

	void addToFollowers(String accountId, String followerId);

	void removeFromFollowers(String accountId, String userIdToDeleteFromFollowers);

}