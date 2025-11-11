package com.tripmates.backend.publications.repository.neo4j;

import com.tripmates.backend.publications.entity.neo4j.Publication;
import org.springframework.data.neo4j.repository.Neo4jRepository;

public interface PublicationRepository extends Neo4jRepository<Publication, String> {
}
