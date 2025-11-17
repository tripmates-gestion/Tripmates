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
			MATCH (f)-[r:REVIEWED]->(p:PublicationNode)
			WHERE r.rating >= 3
			AND NOT EXISTS {
				MATCH (a)-[:REVIEWED]->(p)
			}
			RETURN DISTINCT p
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
			AND NOT EXISTS {
				MATCH (a)-[:REVIEWED]->(p)
			}
			RETURN COUNT(DISTINCT p) as count
			""")
	long countRecommendedPublications(@Param("accountId") String accountId);

	@Query("MATCH (p:PublicationNode {id: $id}) DETACH DELETE p")
	void deletePublicationNodeById(@Param("id") String publicationId);

}
