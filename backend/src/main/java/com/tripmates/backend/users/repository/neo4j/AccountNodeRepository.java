package com.tripmates.backend.users.repository.neo4j;

import com.tripmates.backend.users.entity.neo4j.AccountNode;

import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AccountNodeRepository extends Neo4jRepository<AccountNode, String> {

	/**
	 * Returns all user accounts that are followed by the user, or that have published a
	 * review in a publication where the user has already made a review.
	 * @param accountId user account ID.
	 * @return list of {@link AccountNode}.
	 */
	@Query("""
			         MATCH (a:AccountNode {id: $accountId}),
			               (a)-[:FOLLOWS]->(b:AccountNode),
			               (b)-[:FOLLOWS]->(c:AccountNode)
			         RETURN c AS user

			         UNION

			         MATCH (a:AccountNode {id: $accountId}),
			               (a)-[r1:REVIEWED]->(p:PublicationNode),
			               (b)-[r2:REVIEWED]->(p)
			         WHERE abs(r1.rating - r2.rating) <= 1
			           AND NOT (a)-[:FOLLOWS]->(b)
			           AND a <> b
			         RETURN b AS user
			""")
	List<AccountNode> findAllAccountsRelated(@Param("accountId") String accountId);

	/**
	 * Creates a followed relationship between the two accounts.
	 * @param from the account following.
	 * @param to the account that is being followed.
	 */
	@Query("""
			MATCH (a:AccountNode {id: $from})
			MATCH (b:AccountNode {id: $to})
			MERGE (a)-[:FOLLOWS]->(b)
			""")
	void createFollow(@Param("from") String from, @Param("to") String to);

	/**
	 * Removes a followed relationship between the two accounts.
	 * @param from the account that is unfollowing.
	 * @param to the account that is being unfollowed.
	 */
	@Query("""
			MATCH (a:AccountNode {id: $from})-[f:FOLLOWS]->(b:AccountNode {id: $to})
			DELETE f
			""")
	void removeFollow(@Param("from") String from, @Param("to") String to);

	/**
	 * Creates a reviewed relationship between the user account and the publication that
	 * was reviewed.
	 * @param accountId user account ID.
	 * @param publicationId publication ID.
	 * @param rating review rating.
	 */
	@Query("""
			MATCH (a:AccountNode {id: $accountId})
			MATCH (p:PublicationNode {id: $publicationId})
			MERGE (a)-[r:REVIEWED {reviewId: $reviewId}]->(p)
			SET r.rating = $rating
			""")
	void createReviewed(@Param("accountId") String accountId, @Param("publicationId") String publicationId,
			@Param("reviewId") String reviewId, @Param("rating") Double rating);

}
