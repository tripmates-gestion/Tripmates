package com.tripmates.backend.publications.repository.neo4j;

import com.tripmates.backend.publications.entity.neo4j.PublicationNode;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;

public interface PublicationNodeRepository extends Neo4jRepository<PublicationNode, String> {

	/**
	 * Deletes a publication node and all of it's involved relations.
	 * @param publicationId publication's ID.
	 */
	@Query("MATCH (p:PublicationNode {id: $id}) DETACH DELETE p)")
	void deletePublicationNodeById(@Param("id") String publicationId);

}
