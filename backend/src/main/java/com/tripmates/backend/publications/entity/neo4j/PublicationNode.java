package com.tripmates.backend.publications.entity.neo4j;

import lombok.Data;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.List;

@Data
@Node("PublicationNode")
public class PublicationNode {

	/** PublicationNode's ID. */
	@Id
	private String id;

	/**
	 * PublicationNode's that are part of the same business type.
	 */
	@Relationship(type = "SIMILAR_TO", direction = Relationship.Direction.OUTGOING)
	private List<PublicationNode> publicationNodeList;

}
