package com.tripmates.backend.users.repository.mongo;

import com.mongodb.client.result.UpdateResult;
import com.tripmates.backend.common.types.AttentionSchedule;
import java.util.regex.Pattern;
import com.tripmates.backend.common.types.Plan;
import com.tripmates.backend.common.types.PlanMetadata;
import com.tripmates.backend.common.types.PlanMetadataWithContent;
import com.tripmates.backend.common.types.Review;
import com.tripmates.backend.common.types.Role;
import com.tripmates.backend.common.types.RoomPack;
import com.tripmates.backend.publications.entity.mongo.Publication;
import com.tripmates.backend.users.dto.account.BusinessSearchRequestDTO;
import com.tripmates.backend.users.dto.account.UserSearchRequestDTO;
import com.tripmates.backend.users.entity.mongo.Account;
import org.bson.types.ObjectId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.stereotype.Repository;

@Repository
public class AccountRepositoryCustomImpl implements AccountRepositoryCustom {

	@Autowired
	private MongoTemplate mongoTemplate;

	@Override
	public Page<Account> searchBusiness(BusinessSearchRequestDTO businessSearchRequestDTO, Pageable pageable) {
		List<Criteria> allCriteria = new ArrayList<>();
		allCriteria.addAll(buildBusinessRootCriteria(businessSearchRequestDTO));
		allCriteria.addAll(buildBusinessRoomPacksCriteria(businessSearchRequestDTO));

		Criteria criteria = allCriteria.isEmpty() ? new Criteria()
				: new Criteria().andOperator(allCriteria.toArray(new Criteria[0]));

		Query query = new Query(criteria).with(pageable);

		long total = mongoTemplate.count(query, Account.class);

		return new PageImpl<>(mongoTemplate.find(query, Account.class), pageable, total);
	}

	@Override
	public Page<Account> searchUser(UserSearchRequestDTO userSearchRequestDTO, Pageable pageable) {
		List<Criteria> allCriteria = new ArrayList<>(buildUserRootCriteria(userSearchRequestDTO));

		Criteria criteria = allCriteria.isEmpty() ? new Criteria()
				: new Criteria().andOperator(allCriteria.toArray(new Criteria[0]));

		Query query = new Query(criteria).with(pageable);

		long total = mongoTemplate.count(query, Account.class);

		List<Account> accountList = mongoTemplate.find(query, Account.class)
			.stream()
			.sorted(Comparator.comparing(Account::getFollowersCount).reversed())
			.toList();

		return new PageImpl<>(accountList, pageable, total);
	}

	@Override
	public void addToFollowings(String accountId, String userIdToFollow) {
		Query query = new Query(Criteria.where("_id").is(accountId));
		Update update = new Update().addToSet("followings", userIdToFollow);
		mongoTemplate.updateFirst(query, update, Account.class);
	}

	@Override
	public void removeFromFollowings(String accountId, String userIdToUnfollow) {
		Query query = new Query(Criteria.where("_id").is(accountId));
		Update update = new Update().pull("followings", userIdToUnfollow);
		mongoTemplate.updateFirst(query, update, Account.class);
	}

	@Override
	public void addToFollowers(String accountId, String followerId) {
		Query query = new Query(Criteria.where("_id").is(accountId));
		Update update = new Update().addToSet("followers", followerId);
		mongoTemplate.updateFirst(query, update, Account.class);
	}

	@Override
	public void removeFromFollowers(String accountId, String userIdToDeleteFromFollowers) {
		Query query = new Query(Criteria.where("_id").is(accountId));
		Update update = new Update().pull("followers", userIdToDeleteFromFollowers);
		mongoTemplate.updateFirst(query, update, Account.class);
	}

	/**
	 * Returns a {@link Criteria} with the filters that involve attributes that are in the
	 * root of the document.
	 * @param businessSearchRequestDTO DTO with the filters.
	 * @return {@link Criteria}.
	 */
	private List<Criteria> buildBusinessRootCriteria(BusinessSearchRequestDTO businessSearchRequestDTO) {
		List<Criteria> criteria = new ArrayList<>();

		criteria.add(Criteria.where("role").is(Role.BUSINESS));

		if (businessSearchRequestDTO.averagePrice() != null)
			criteria.add(Criteria.where("averagePrice").is(businessSearchRequestDTO.averagePrice()));

		if (businessSearchRequestDTO.location() != null && businessSearchRequestDTO.location().address() != null) {
			criteria.add(Criteria.where("location.address").regex(businessSearchRequestDTO.location().address(), "i"));
		}

		if (businessSearchRequestDTO.username() != null)
			criteria.add(Criteria.where("name").regex(businessSearchRequestDTO.username(), "i"));

		if (businessSearchRequestDTO.businessType() != null)
			criteria.add(Criteria.where("businessType").is(businessSearchRequestDTO.businessType()));

		if (businessSearchRequestDTO.restaurantType() != null)
			criteria.add(Criteria.where("restaurantType").is(businessSearchRequestDTO.restaurantType()));

		if (businessSearchRequestDTO.hotelType() != null)
			criteria.add(Criteria.where("hotelType").is(businessSearchRequestDTO.hotelType()));

		if (businessSearchRequestDTO.attentionSchedule() != null) {
			AttentionSchedule schedule = businessSearchRequestDTO.attentionSchedule();

			if (schedule.openingTime() != null)
				criteria.add(Criteria.where("attentionSchedule.openingTime").lte(schedule.openingTime()));

			if (schedule.closingTime() != null)
				criteria.add(Criteria.where("attentionSchedule.closingTime").gte(schedule.closingTime()));
		}

		return criteria;
	}

	/**
	 * Returns a {@link Criteria} with the filters that involve attributes that are
	 * embedded in the document.
	 * @param businessSearchRequestDTO DTO with the filters.
	 * @return {@link Criteria}.
	 */
	private List<Criteria> buildBusinessRoomPacksCriteria(BusinessSearchRequestDTO businessSearchRequestDTO) {
		List<Criteria> roomPacksCriteria = new ArrayList<>();

		if (businessSearchRequestDTO.roomPacksList() != null) {
			for (RoomPack roomPack : businessSearchRequestDTO.roomPacksList()) {
				List<Criteria> roomPackCriteria = new ArrayList<>();

				if (roomPack.numberOfGuests() != null)
					roomPackCriteria.add(Criteria.where("numberOfGuests").is(roomPack.numberOfGuests()));

				if (roomPack.checkInDate() != null)
					roomPackCriteria.add(Criteria.where("checkInDate").lte(roomPack.checkInDate()));

				if (roomPack.checkOutDate() != null)
					roomPackCriteria.add(Criteria.where("checkOutDate").gte(roomPack.checkOutDate()));

				if (!roomPackCriteria.isEmpty())
					roomPacksCriteria.add(Criteria.where("roomPacks")
						.elemMatch(new Criteria().andOperator(roomPackCriteria.toArray(new Criteria[0]))));
			}
		}

		return roomPacksCriteria;
	}

	/**
	 * Returns a {@link Criteria} with the filters that involve attributes that are in the
	 * root of the document.
	 * @param userSearchRequestDTO DTO with the filters.
	 * @return {@link Criteria}.
	 */
	private List<Criteria> buildUserRootCriteria(UserSearchRequestDTO userSearchRequestDTO) {
		List<Criteria> criteria = new ArrayList<>();

		criteria.add(Criteria.where("role").is(Role.USER));

		if (userSearchRequestDTO.username() != null)
			criteria.add(Criteria.where("name").regex(userSearchRequestDTO.username(), "i"));

		if (userSearchRequestDTO.followings() != null)
			criteria.add(Criteria.where("following." + (userSearchRequestDTO.followings() - 1)).exists(true));

		if (userSearchRequestDTO.followers() != null)
			criteria.add(Criteria.where("followers." + (userSearchRequestDTO.followers() - 1)).exists(true));

		if (userSearchRequestDTO.address() != null) {
			List<String> userIdsWithMatchingReviews = userIDsWithReviewInPublicationWithLocationAddress(
					userSearchRequestDTO.address());
			if (!userIdsWithMatchingReviews.isEmpty()) {
				criteria.add(Criteria.where("id").in(userIdsWithMatchingReviews));
			}
			else {
				// If no users found with matching reviews, ensure no results are returned
				criteria.add(Criteria.where("id").is("non-existent-id"));
			}
		}

		return criteria;
	}

	/**
	 * Returns all users ID which have made a review in a publication with a matching
	 * address.
	 * @param address partial address to search for in publication locations
	 * @return list of unique {@link String} user IDs.
	 */
	private List<String> userIDsWithReviewInPublicationWithLocationAddress(String address) {
		Set<String> userIds = new HashSet<>();

		// Search for publications with address containing the search term (case
		// insensitive)
		String searchPattern = ".*" + Pattern.quote(address.trim()) + ".*";
		Query query = new Query();
		query.addCriteria(Criteria.where("location.address").regex(searchPattern, "i"));
		query.fields().include("reviews.ownerId");

		List<Publication> publicationList = mongoTemplate.find(query, Publication.class);

		for (Publication publication : publicationList) {
			if (publication.getReviews() != null) {
				publication.getReviews()
					.stream()
					.map(Review::getOwnerId)
					.filter(Objects::nonNull)
					.forEach(userIds::add);
			}
		}

		return new ArrayList<>(userIds);
	}

	@Override
	public PlanMetadata getPlanMetadataById(String planId) {
		ObjectId targetPlanId = new ObjectId(planId);

		Aggregation aggregation = Aggregation.newAggregation(
				Aggregation.match(Criteria.where("plansList._id").is(targetPlanId)), Aggregation.unwind("plansList"),
				Aggregation.match(Criteria.where("plansList._id").is(targetPlanId)),
				Aggregation.project()
					.and("plansList.name")
					.as("name")
					.and("plansList.description")
					.as("description")
					.and("plansList.ownerId")
					.as("ownerId")
					.and("plansList.collaboratorsUsersIds")
					.as("collaboratorsIds")
					.and("plansList.pendingUsersIdsInvited")
					.as("pendingUsersIdsInvited")
					.and("plansList._id")
					.as("planId"));

		AggregationResults<PlanMetadata> results = mongoTemplate.aggregate(aggregation, "account", PlanMetadata.class);

		return results.getUniqueMappedResult();
	}

	@Override
	public List<String> getPlanPublicationsIds(String planId) {
		ObjectId planObjectId = new ObjectId(planId);
		Aggregation aggregation = Aggregation.newAggregation(
				Aggregation.match(Criteria.where("plansList._id").is(planObjectId)), Aggregation.unwind("plansList"),
				Aggregation.match(Criteria.where("plansList._id").is(planObjectId)),
				Aggregation.project("plansList.publicationsIdList")
					.and("plansList.publicationsIdList")
					.as("publicationsIdList"));

		AggregationResults<PublicationIdsProjection> results = mongoTemplate.aggregate(aggregation, "account",
				PublicationIdsProjection.class);
		PublicationIdsProjection projection = results.getUniqueMappedResult();
		return projection != null ? projection.publicationsIdList : List.of();
	}

	@Override
	public void addUserIdToPendingUsersIdsInvitedToPlan(String planId, String userIdInvited) {
		ObjectId planObjectId = new ObjectId(planId);
		Query query = new Query(Criteria.where("plansList._id").is(planObjectId));

		Update update = new Update().addToSet("plansList.$[plan].pendingUsersIdsInvited", userIdInvited)
			.filterArray(Criteria.where("plan._id").is(planObjectId));

		mongoTemplate.updateFirst(query, update, Account.class);
	}

	@Override
	public void removeUserIdFromPendingUsersIdsInvitedToPlan(String planId, String userIdInvited) {
		ObjectId planObjectId = new ObjectId(planId);
		Query query = new Query(Criteria.where("plansList._id").is(planObjectId));

		Update update = new Update().pull("plansList.$[plan].pendingUsersIdsInvited", userIdInvited)
			.filterArray(Criteria.where("plan._id").is(planObjectId));

		mongoTemplate.updateFirst(query, update, Account.class);
	}

	@Override
	public void upgradeUserFromInvitedToCollaborator(String planId, String userIdInvited) {
		ObjectId planObjectId = new ObjectId(planId);
		Query query = new Query(Criteria.where("plansList._id").is(planObjectId));

		Update update = new Update().pull("plansList.$[plan].pendingUsersIdsInvited", userIdInvited)
			.addToSet("plansList.$[plan].collaboratorsUsersIds", userIdInvited)
			.filterArray(Criteria.where("plan._id").is(planObjectId));

		mongoTemplate.updateFirst(query, update, Account.class);
	}

	@Override
	public List<PlanMetadataWithContent> getCollaborationsPlansByUserId(String collaboratorId) {
		Aggregation aggregation = Aggregation.newAggregation(Aggregation.unwind("plansList"),
				Aggregation.match(Criteria.where("plansList.collaboratorsUsersIds").is(collaboratorId)),
				Aggregation.project()
					.and("plansList._id")
					.as("planId")
					.and("plansList.name")
					.as("name")
					.and("plansList.description")
					.as("description")
					.and("plansList.ownerId")
					.as("ownerId")
					.and("plansList.collaboratorsUsersIds")
					.as("collaboratorsIds")
					.and("plansList.pendingUsersIdsInvited")
					.as("pendingUsersIdsInvited")
					.and("plansList.publicationsIdList")
					.as("publicationsIds"));

		AggregationResults<PlanMetadataWithContent> results = mongoTemplate.aggregate(aggregation, "account",
				PlanMetadataWithContent.class);

		return results.getMappedResults();
	}

	@Override
	public Plan getPlanByPlanId(String planId) {

		if (!ObjectId.isValid(planId)) {
			return null;
		}
		ObjectId targetPlanId = new ObjectId(planId);

		Aggregation aggregation = Aggregation.newAggregation(
				Aggregation.match(Criteria.where("plansList._id").is(targetPlanId)), Aggregation.unwind("plansList"),
				Aggregation.match(Criteria.where("plansList._id").is(targetPlanId)),
				Aggregation.project()
					.andExclude("_id")
					.andExpression("{$toString: '$plansList._id'}")
					.as("id")
					.and("plansList.name")
					.as("name")
					.and("plansList.description")
					.as("description")
					.and("plansList.ownerId")
					.as("ownerId")
					.and("plansList.collaboratorsUsersIds")
					.as("collaboratorsUsersIds")
					.and("plansList.pendingUsersIdsInvited")
					.as("pendingUsersIdsInvited")
					.and("plansList.publicationsIdList")
					.as("publicationsIdList"));
		AggregationResults<Plan> results = mongoTemplate.aggregate(aggregation, "account", Plan.class);

		Plan foundPlan = results.getUniqueMappedResult();

		if (foundPlan != null) {
			foundPlan.setId(planId);
		}
		return foundPlan;
	}

	@Override
	public Plan updateExistingPlan(Plan updatedPlan) {
		if (updatedPlan.getId() == null || !ObjectId.isValid(updatedPlan.getId())) {
			System.err.println("Error: El ID del plan a actualizar no es válido.");
			return null;
		}
		ObjectId targetPlanId = new ObjectId(updatedPlan.getId());
		String ownerId = updatedPlan.getOwnerId();
		Query query = new Query(Criteria.where("_id").is(ownerId));
		Update update = new Update().set("plansList.$[plan].name", updatedPlan.getName())
			.set("plansList.$[plan].description", updatedPlan.getDescription())
			.set("plansList.$[plan].publicationsIdList", updatedPlan.getPublicationsIdList())
			.set("plansList.$[plan].pendingUsersIdsInvited", updatedPlan.getPendingUsersIdsInvited())
			.set("plansList.$[plan].collaboratorsUsersIds", updatedPlan.getCollaboratorsUsersIds())
			.filterArray(Criteria.where("plan._id").is(targetPlanId));
		UpdateResult result = mongoTemplate.updateFirst(query, update, "account");

		if (result.getModifiedCount() > 0) {
			return getPlanByPlanId(updatedPlan.getId());
		}

		return null;
	}

	private static class PublicationIdsProjection {

		private List<String> publicationsIdList;

	}

}
