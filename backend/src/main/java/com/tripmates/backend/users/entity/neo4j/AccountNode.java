package com.tripmates.backend.users.entity.neo4j;

import com.tripmates.backend.common.types.BusinessType;
import com.tripmates.backend.common.types.Role;
import com.tripmates.backend.publications.entity.neo4j.PublicationNode;
import com.tripmates.backend.publications.entity.neo4j.ReviewRelationship;
import com.tripmates.backend.users.entity.mongo.Account;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Node("AccountNode")
public class AccountNode {

	/** AccountNode's ID. */
	@Id
	private String id;

    /**
     * AccountNode's role.
     */
    private Role role;

    /**
     * AccountNode's business type. Only allowed in business account.
     */
    private BusinessType businessType;

	/**
	 * AccountNode's acquaintances. Only allowed in user account.
	 */
	@Relationship(type = "FOLLOWS", direction = Relationship.Direction.OUTGOING)
	private List<AccountNode> userAccountNodeList;

	/**
	 * Publications where the account has made a review. Only allowed in user account.
	 */
	@Relationship(type = "REVIEWED", direction = Relationship.Direction.OUTGOING)
	private List<ReviewRelationship> reviewRelationshipList;

    /**
     * AccountNode's that have the same business type. Only allowed in business account.
     */
    @Relationship(type = "SHARES_BUSINESS_TYPE", direction = Relationship.Direction.OUTGOING)
    private List<AccountNode> businessAccountNodeList;

    /**
     * AccountNode's publications. Only allowed in business account.
     */
    @Relationship(type = "OWNS", direction = Relationship.Direction.OUTGOING)
    private List<PublicationNode> publicationNodeList;

	/**
	 * Returns a {@link AccountNode} from an {@link Account}.
	 * @param account account with user data.
	 * @return {@link AccountNode}.
	 */
	public static AccountNode fromAccount(Account account) {
		return new AccountNode(account.getId(), account.getRole(), account.getBusinessType(), new ArrayList<>(), new ArrayList<>(), new ArrayList<>(), new ArrayList<>());
	}

}
