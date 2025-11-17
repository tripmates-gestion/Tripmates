package com.tripmates.backend.publications.entity.neo4j;

import lombok.Data;
import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.RelationshipProperties;
import org.springframework.data.neo4j.core.schema.TargetNode;

@Data
@RelationshipProperties
public class ReviewRelationship {

	/**
	 * ReviewRelationship's ID. Required by Neo4j
	 */
	@Id
	@GeneratedValue
	private String id;

	/**
	 * Review's ID.
	 */
	private String reviewId;

	/**
	 * ReviewRelationship's rating.
	 */
	private Double rating;

	/**
	 * ReviewRelationship's target publication node.
	 */
	@TargetNode
	private PublicationNode publicationNode;

}
