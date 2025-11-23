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
			         RETURN DISTINCT c AS user

			         UNION

			         MATCH (a:AccountNode {id: $accountId}),
			             (a)-[r1:REVIEWED]->(p:PublicationNode),
			             (b:AccountNode)-[r2:REVIEWED]->(p)
			         WHERE abs(r1.rating - r2.rating) <= 1
			             AND NOT (a)-[:FOLLOWS]->(b)
			             AND a <> b
			         RETURN DISTINCT b AS user
			""")
	List<AccountNode> findAllAccountsRelated(@Param("accountId") String accountId);

	/**
	 * Returns all business accounts that have the same business type as a business
	 * account where the user has made a positive or neutral review.
	 * @param accountId user account ID.
	 * @return list of {@link AccountNode}.
	 */
	@Query("""
			         MATCH (a:AccountNode {id: $accountId}),
			               (a)-[r:REVIEWED]->(p:PublicationNode),
			               (p)<-[:CREATED]-(b),
			               (b)-[:SHARES_BUSINESS_TYPE]->(c:AccountNode)
			         WHERE r.rating >= 3
			         RETURN DISTINCT c AS user

			         UNION

			         MATCH (a:AccountNode {id: $accountId}),
			               (a)-[:LIKED]->(p:PublicationNode),
			               (p)<-[:CREATED]-(b),
			               (b)-[:SHARES_BUSINESS_TYPE]->(c:AccountNode)
			         RETURN DISTINCT c AS user
			""")
	List<AccountNode> findAllBusinessRelated(@Param("accountId") String accountId);

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

	/**
	 * Creates a liked relationship between the user account and the publication that was
	 * liked.
	 * @param accountId user account ID.
	 * @param publicationId publication ID.
	 */
	@Query("""
			MATCH (a:AccountNode {id: $accountId})
			MATCH (p:PublicationNode {id: $publicationId})
			MERGE (a)-[r:LIKED]->(p)
			SET r.createdAt = datetime()
			""")
	void createLiked(@Param("accountId") String accountId, @Param("publicationId") String publicationId);

	/**
	 * Removes a liked relationship between the user account and the publication.
	 * @param accountId user account ID.
	 * @param publicationId publication ID.
	 */
	@Query("""
			MATCH (a:AccountNode {id: $accountId})-[l:LIKED]->(p:PublicationNode {id: $publicationId})
			DELETE l
			""")
	void removeLiked(@Param("accountId") String accountId, @Param("publicationId") String publicationId);

	/**
	 * Creates an own relationship between a business account and a publication.
	 * @param businessId business account ID.
	 * @param publicationId publication ID.
	 */
	@Query("""
			MATCH (a:AccountNode {id: $businessId})
			MATCH (p:PublicationNode {id: $publicationId})
			MERGE (a)-[r:CREATED]->(p)
			SET r.createdAt = datetime()
			""")
	void createOwnsPublication(@Param("businessId") String businessId, @Param("publicationId") String publicationId);

	/**
	 * Creates a share the same business type relationship between two business account.
	 * @param businessId business account ID.
	 */
	@Query("""
			MATCH (a:AccountNode {id: $businessId})
			MATCH (b:AccountNode)
			WHERE a.businessType IS NOT NULL
			    AND b.businessType = a.businessType
			    AND a <> b
			MERGE (a)-[:SHARES_BUSINESS_TYPE]->(b)
			MERGE (b)-[:SHARES_BUSINESS_TYPE]->(a)
			""")
	void createSharesBusinessType(@Param("businessId") String businessId);

}
