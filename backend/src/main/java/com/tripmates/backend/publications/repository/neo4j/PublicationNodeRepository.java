package com.tripmates.backend.publications.repository.neo4j;

import com.tripmates.backend.publications.entity.neo4j.PublicationNode;
import org.springframework.data.neo4j.repository.Neo4jRepository;

public interface PublicationNodeRepository extends Neo4jRepository<PublicationNode, String> {

}
