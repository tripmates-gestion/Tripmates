package com.tripmates.backend.users.repository.mongo;

import com.tripmates.backend.common.types.AttentionSchedule;
import com.tripmates.backend.common.types.RoomPack;
import com.tripmates.backend.users.dto.AccountSearchRequestDTO;
import com.tripmates.backend.users.entity.mongo.Account;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.MongoExpression;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;

@Repository
public class AccountRepositoryCustomImpl implements AccountRepositoryCustom {

	@Autowired
	private MongoTemplate mongoTemplate;

	@Override
	public Page<Account> searchAccount(AccountSearchRequestDTO accountSearchRequestDTO, Pageable pageable) {
		List<Criteria> allCriteria = new ArrayList<>();
		allCriteria.addAll(buildRootCriteria(accountSearchRequestDTO));
		allCriteria.addAll(buildRoomPacksCriteria(accountSearchRequestDTO));

		Criteria criteria = allCriteria.isEmpty() ? new Criteria()
				: new Criteria().andOperator(allCriteria.toArray(new Criteria[0]));

		Query query = new Query(criteria).with(pageable);

		List<Account> accountList = mongoTemplate.find(query, Account.class)
			.stream()
			.sorted(Comparator.comparing(Account::getFollowersCount).reversed())
			.toList();

		return new PageImpl<>(accountList, pageable, accountList.size());
	}

	/**
	 * Returns a {@link Criteria} with the filters that involve attributes that are in the
	 * root of the document.
	 * @param accountSearchRequestDTO DTO with the filters.
	 * @return {@link Criteria}.
	 */
	private List<Criteria> buildRootCriteria(AccountSearchRequestDTO accountSearchRequestDTO) {
		List<Criteria> criteria = new ArrayList<>();

		if (accountSearchRequestDTO.followings() != null)
			criteria.add(Criteria.where("following." + (accountSearchRequestDTO.followings() - 1)).exists(true));

		if (accountSearchRequestDTO.followers() != null)
			criteria.add(Criteria.where("followers." + (accountSearchRequestDTO.followers() - 1)).exists(true));

		if (accountSearchRequestDTO.averagePrice() != null)
			criteria.add(Criteria.where("averagePrice").is(accountSearchRequestDTO.averagePrice()));

		if (accountSearchRequestDTO.location() != null)
			criteria.add(Criteria.where("location").is(accountSearchRequestDTO.location()));

		if (accountSearchRequestDTO.username() != null)
			criteria.add(Criteria.where("name").regex(accountSearchRequestDTO.username(), "i"));

		if (accountSearchRequestDTO.businessType() != null)
			criteria.add(Criteria.where("businessType").is(accountSearchRequestDTO.businessType()));

		if (accountSearchRequestDTO.restaurantType() != null)
			criteria.add(Criteria.where("restaurantType").is(accountSearchRequestDTO.restaurantType()));

		if (accountSearchRequestDTO.hotelType() != null)
			criteria.add(Criteria.where("hotelType").is(accountSearchRequestDTO.hotelType()));

		if (accountSearchRequestDTO.attentionSchedule() != null) {
			AttentionSchedule schedule = accountSearchRequestDTO.attentionSchedule();

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
	 * @param accountSearchRequestDTO DTO with the filters.
	 * @return {@link Criteria}.
	 */
	private List<Criteria> buildRoomPacksCriteria(AccountSearchRequestDTO accountSearchRequestDTO) {
		List<Criteria> roomPacksCriteria = new ArrayList<>();

		if (accountSearchRequestDTO.roomPacksList() != null) {
			for (RoomPack roomPack : accountSearchRequestDTO.roomPacksList()) {
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

}
