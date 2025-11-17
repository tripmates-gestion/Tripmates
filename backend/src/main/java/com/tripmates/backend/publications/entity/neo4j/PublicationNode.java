package com.tripmates.backend.publications.entity.neo4j;

import com.tripmates.backend.publications.entity.mongo.Publication;
import com.tripmates.backend.users.entity.mongo.Account;
import com.tripmates.backend.users.entity.neo4j.AccountNode;
import lombok.AllArgsConstructor;
import lombok.Data;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@Node("PublicationNode")
public class PublicationNode {

	/** PublicationNode's ID. */
	@Id
	private String id;

	/**
	 * Returns a {@link PublicationNode} from an {@link Publication}.
	 * @param publication account with user data.
	 * @return {@link PublicationNode}.
	 */
	public static PublicationNode fromPublication(Publication publication) {
		return new PublicationNode(publication.getId());
	}

}
