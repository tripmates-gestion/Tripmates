package com.tripmates.backend.users.repository.mongo;

import com.tripmates.backend.common.types.AttentionSchedule;
import com.tripmates.backend.common.types.PlanMetadata;
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
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
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

		if (businessSearchRequestDTO.location() != null)
			criteria.add(Criteria.where("location").is(businessSearchRequestDTO.location()));

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

		if (userSearchRequestDTO.followings() != null)
			criteria.add(Criteria.where("following." + (userSearchRequestDTO.followings() - 1)).exists(true));

		if (userSearchRequestDTO.followers() != null)
			criteria.add(Criteria.where("followers." + (userSearchRequestDTO.followers() - 1)).exists(true));

		if (userSearchRequestDTO.location() != null)
			criteria.add(Criteria.where("_id")
				.in(userIDsWithReviewInPublicationWithLocation(userSearchRequestDTO.location())));

		return criteria;
	}

	/**
	 * Returns all users ID which have made a review in a publication with location.
	 * @param location location where the publication was made.
	 * @return list of {@link String} IDs.
	 */
	private List<String> userIDsWithReviewInPublicationWithLocation(String location) {
		List<String> userIDsList = new ArrayList<>();

		Query query = new Query(Criteria.where("location").regex(location, "i"));
		query.fields().include("reviews.ownerId");

		List<Publication> publicationList = mongoTemplate.find(query, Publication.class);
		for (Publication publication : publicationList) {
			if (publication.getReviews() == null)
				continue;

			for (Review review : publication.getReviews())
				userIDsList.add(review.getOwnerId());
		}

		return userIDsList;
	}


  @Override
  public PlanMetadata getPlanMetadataById(String planId) {
    ObjectId targetPlanId = new ObjectId(planId);

    Aggregation aggregation = Aggregation.newAggregation(
      Aggregation.match(Criteria.where("plansList._id").is(targetPlanId)),
      Aggregation.unwind("plansList"),
      Aggregation.match(Criteria.where("plansList._id").is(targetPlanId)),
      Aggregation.project()
          .and("plansList.name").as("name")
          .and("plansList.description").as("description")
          .and("plansList.ownerId").as("ownerId")
          .and("plansList.collaboratorsUsersIds").as("collaboratorsIds")
          .and("plansList.pendingUsersIdsInvited").as("pendingUsersIdsInvited")
    );

    AggregationResults<PlanMetadata> results = mongoTemplate.aggregate(
      aggregation,
      "account",
      PlanMetadata.class
    );
    
    return results.getUniqueMappedResult();
  }

  @Override
  public void addUserIdToPendingUsersIdsInvitedToPlan(String planId, String userIdInvited) {
    ObjectId planObjectId = new ObjectId(planId);
    Query query = new Query(Criteria.where("plansList._id").is(planObjectId));

    Update update = new Update()
      .addToSet("plansList.$[plan].pendingUsersIdsInvited", userIdInvited)
      .filterArray(Criteria.where("plan._id").is(planObjectId));

    mongoTemplate.updateFirst(query, update, Account.class);
  }

  @Override
  public void removeUserIdFromPendingUsersIdsInvitedToPlan(String planId, String userIdInvited) {
    ObjectId planObjectId = new ObjectId(planId);
    Query query = new Query(Criteria.where("plansList._id").is(planObjectId));

    Update update = new Update()
      .pull("plansList.$[plan].pendingUsersIdsInvited", userIdInvited)
      .filterArray(Criteria.where("plan._id").is(planObjectId));

    mongoTemplate.updateFirst(query, update, Account.class);
  }

  @Override
  public void upgradeUserFromInvitedToCollaborator(String planId, String userIdInvited) {
    ObjectId planObjectId = new ObjectId(planId);
    Query query = new Query(Criteria.where("plansList._id").is(planObjectId));

    Update update = new Update()
      .pull("plansList.$[plan].pendingUsersIdsInvited", userIdInvited)
      .addToSet("plansList.$[plan].collaboratorsUsersIds", userIdInvited)
      .filterArray(Criteria.where("plan._id").is(planObjectId));

    mongoTemplate.updateFirst(query, update, Account.class);
  }

}
