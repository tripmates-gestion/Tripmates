package com.tripmates.backend.publications.repository.mongo;

import com.tripmates.backend.publications.entity.mongo.Publication;
import com.tripmates.backend.publications.dto.PublicationSearchRequestDTO;

import java.util.Date;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PublicationRepositoryCustom {

	/**
	 * Returns publications that match the specified filters, if there are no filters
	 * specified then it returns all.
	 * @param filters publication filters.
	 * @param pageable page configuration.
	 * @return page of {@link Publication}.
	 */
	Page<Publication> search(PublicationSearchRequestDTO filters, Pageable pageable);

	/**
	 * Returns all review dates for a specific business that fall within the date range.
	 * @param businessId business's account ID.
	 * @param startDate start date.
	 * @param endDate end date.
	 * @return list of {@link Date}.
	 */
	List<Date> findReviewDatesByBusinessIdAndDateRange(String businessId, Date startDate, Date endDate);

	/**
	 * Returns all the likes made to publications from the business account.
	 * @param accountId business's account ID.
	 * @return amount of likes as {@link Integer}.
	 */
	Integer countLikesFromAccountId(String accountId);

	/**
	 * Adds a like to the publication, made by the user.
	 * @param publicationId publication's ID.
	 * @param userId user's account ID.
	 */
	void addToLikes(String publicationId, String userId);

	/**
	 * Removes a like to the publication, made by the user.
	 * @param publicationId publication's ID.
	 * @param userId user's account ID.
	 */
	void removeFromLikes(String publicationId, String userId);

  /**
   * Returns the n most liked publications.
   * @param n number of publications to return.
   * @return list of {@link PublicationResumeResponseDTO}.
   */
  List<Publication> findNMostLikedsPublications(int n);
}
