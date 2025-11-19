package com.tripmates.backend.publications.entity.neo4j;

import lombok.Data;
import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.RelationshipProperties;
import org.springframework.data.neo4j.core.schema.TargetNode;

import java.time.LocalDateTime;

@Data
@RelationshipProperties
public class CreatedRelationship {

	/**
	 * CreatedRelationship's ID. Required by Neo4j
	 */
	@Id
	@GeneratedValue
	private String id;

	/**
	 * Date when the publication was created.
	 */
	private LocalDateTime createdAt;

	/**
	 * CreatedRelationship's target publication node.
	 */
	@TargetNode
	private PublicationNode publicationNode;

}
