package com.tripmates.backend.users.repository.mongo;

import com.tripmates.backend.common.types.Plan;
import com.tripmates.backend.common.types.PlanMetadata;
import com.tripmates.backend.common.types.PlanMetadataWithContent;

import com.tripmates.backend.users.dto.account.BusinessSearchRequestDTO;
import com.tripmates.backend.users.dto.account.UserSearchRequestDTO;
import com.tripmates.backend.users.entity.mongo.Account;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AccountRepositoryCustom {

	/**
	 * Returns all business accounts that match the filter, if there are no filters then
	 * it returns all the business accounts.
	 * @param businessSearchRequestDTO DTO with the filters.
	 * @param pageable page configuration.
	 * @return a page of {@link Account}.
	 */
	Page<Account> searchBusiness(BusinessSearchRequestDTO businessSearchRequestDTO, Pageable pageable);

	/**
	 * Returns all users accounts that match the filter, if there are no filters then it
	 * returns all the users accounts.
	 * @param userSearchRequestDTO DTO with the filters.
	 * @param pageable page configuration.
	 * @return a page of {@link Account}.
	 */
	Page<Account> searchUser(UserSearchRequestDTO userSearchRequestDTO, Pageable pageable);

	void addToFollowings(String accountId, String userIdToFollow);

	void removeFromFollowings(String accountId, String userIdToUnfollow);

	void addToFollowers(String accountId, String followerId);

	void removeFromFollowers(String accountId, String userIdToDeleteFromFollowers);

	PlanMetadata getPlanMetadataById(String planId);

	void addUserIdToPendingUsersIdsInvitedToPlan(String planId, String userIdInvited);

	void removeUserIdFromPendingUsersIdsInvitedToPlan(String planId, String userIdInvited);

	void upgradeUserFromInvitedToCollaborator(String planId, String userIdInvited);

	List<String> getPlanPublicationsIds(String planId);

	List<PlanMetadataWithContent> getCollaborationsPlansByUserId(String collaboratorId);

	Plan getPlanByPlanId(String planId);

	Plan updateExistingPlan(Plan updatedPlan);

}