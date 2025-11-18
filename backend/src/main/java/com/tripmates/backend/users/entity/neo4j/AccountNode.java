package com.tripmates.backend.users.entity.neo4j;

import java.util.ArrayList;
import java.util.List;

import com.tripmates.backend.publications.entity.neo4j.CreatedRelationship;
import com.tripmates.backend.publications.entity.neo4j.LikedRelationship;
import com.tripmates.backend.publications.entity.neo4j.ReviewRelationship;
import com.tripmates.backend.users.entity.mongo.Account;
import lombok.AllArgsConstructor;
import lombok.Data;

import lombok.NoArgsConstructor;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Node("AccountNode")
public class AccountNode {

	/**
	 * Account's ID.
	 */
	@Id
	private String id;

	/**
	 * AccountNode's acquaintances.
	 */
	@Relationship(type = "FOLLOWS", direction = Relationship.Direction.OUTGOING)
	private List<AccountNode> accountNodeList;

	/**
	 * Publications where the account has made a review.
	 */
	@Relationship(type = "REVIEWED", direction = Relationship.Direction.OUTGOING)
	private List<ReviewRelationship> reviewRelationshipList;

	/**
	 * Publications that the account has liked.
	 */
	@Relationship(type = "LIKED", direction = Relationship.Direction.OUTGOING)
	private List<LikedRelationship> likedRelationshipList;

	/**
	 * Publications that the account has created.
	 */
	@Relationship(type = "CREATED", direction = Relationship.Direction.OUTGOING)
	private List<CreatedRelationship> createdRelationshipList;

	/**
	 * Returns a {@link AccountNode} from an {@link Account}.
	 * @param account account with user data.
	 * @return {@link AccountNode}.
	 */
	public static AccountNode fromAccount(Account account) {
		return new AccountNode(String.valueOf(account.getId()), new ArrayList<>(), new ArrayList<>(), new ArrayList<>(), new ArrayList<>());
	}

}
