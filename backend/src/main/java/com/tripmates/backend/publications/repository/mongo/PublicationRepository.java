package com.tripmates.backend.publications.repository.mongo;

import com.tripmates.backend.publications.entity.mongo.Publication;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface PublicationRepository extends MongoRepository<Publication, String>, PublicationRepositoryCustom {

	java.util.List<Publication> findByOwnerId(String ownerId);

	/**
	 * Checks if a user has liked a publication.
	 * @param publicationId The ID of the publication
	 * @param userId The ID of the user who liked
	 * @return true if the user has liked the publication, false otherwise
	 */
	@Query(value = "{ '_id': ?0, 'likes.userId': ?1 }", count = true)
	long existsLike(String publicationId, String userId);

	/**
	 * Returns all publications that the user liked.
	 * @param userId user account ID.
	 * @return list of {@link Publication},
	 */
	@Query("{ 'likes.userId' :  ?0 }")
	List<Publication> findByLikesUserId(String userId);

}
