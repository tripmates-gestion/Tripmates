package com.tripmates.backend.publications.repository.neo4j;

import com.tripmates.backend.publications.entity.neo4j.PublicationNode;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PublicationNodeRepository extends Neo4jRepository<PublicationNode, String> {

	@Query("""
			MATCH (a:AccountNode {id: $accountId})-[:FOLLOWS*1..2]->(f:AccountNode)
			WITH DISTINCT a, f
			
			// Publications with high ratings
			MATCH (f)-[r:REVIEWED]->(p:PublicationNode)
			    WHERE r.rating >= 3
			    AND r.rating IS NOT NULL
			    AND NOT (a)-[:REVIEWED]->(p)
			
			// Publications liked by followed users
			WITH a, COLLECT(p) AS highRatedPubs, f
			MATCH (f)-[l:LIKED]->(pl:PublicationNode)
			    WHERE NOT (a)-[:LIKED]->(pl)
			    AND NOT (a)-[:REVIEWED]->(pl)
			
			// Publications from creators of highly rated publications
			WITH a, highRatedPubs, COLLECT(pl) AS likedPubs, f
			MATCH (f)-[r:REVIEWED]->(p1:PublicationNode)
			    WHERE r.rating >= 3
			    AND r.rating IS NOT NULL
			    AND NOT (a)-[:REVIEWED]->(p1)
			MATCH (creator:AccountNode)-[:CREATED]->(p1)
			MATCH (creator)-[:CREATED]->(pc:PublicationNode)
			    WHERE NOT (a)-[:CREATED]->(pc)
			    AND NOT (a)-[:REVIEWED]->(pc)
			    AND NOT (a)-[:LIKED]->(pc)
			
			// Publications from creators of liked publications
			WITH a, highRatedPubs, likedPubs, COLLECT(pc) AS creatorHighRatedPubs, f
			MATCH (f)-[l:LIKED]->(pl1:PublicationNode)
			    WHERE NOT (a)-[:LIKED]->(pl1)
			    AND NOT (a)-[:REVIEWED]->(pl1)
			MATCH (creator2:AccountNode)-[:CREATED]->(pl1)
			MATCH (creator2)-[:CREATED]->(pc2:PublicationNode)
			    WHERE NOT (a)-[:CREATED]->(pc2)
			    AND NOT (a)-[:REVIEWED]->(pc2)
			    AND NOT (a)-[:LIKED]->(pc2)
			
			// Combine all publications and return distinct
			WITH a, highRatedPubs + likedPubs + creatorHighRatedPubs + COLLECT(pc2) AS allPublications
			UNWIND allPublications AS pub
			RETURN DISTINCT pub
			ORDER BY rand()
			SKIP $skip
			LIMIT $limit
			""")
	List<PublicationNode> findRecommendedPublications(@Param("accountId") String accountId, @Param("skip") int skip,
			@Param("limit") int limit);

	@Query("""
			MATCH (a:AccountNode {id: $accountId})-[:FOLLOWS*1..2]->(f:AccountNode)
			WITH DISTINCT a, f
			MATCH (f)-[r:REVIEWED]->(p:PublicationNode)
			WHERE r.rating >= 3
			AND r.rating IS NOT NULL
			AND NOT (a)-[:REVIEWED]->(p)
			RETURN COUNT(DISTINCT p) as count
			""")
	long countRecommendedPublications(@Param("accountId") String accountId);

	/**
	 * Deletes a publication node and all of its relations
	 * @param publicationId
	 */
	@Query("MATCH (p:PublicationNode {id: $id}) DETACH DELETE p")
	void deletePublicationNodeById(@Param("id") String publicationId);

}
