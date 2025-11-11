package com.tripmates.backend.users.entity.neo4j;

import com.tripmates.backend.publications.entity.neo4j.Publication;

import java.util.List;

import lombok.Data;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

@Data
@Node("Account")
public class Account {

    /** Account's ID. */
    @Id
    private String id;

    /**
     * Account's acquaintances.
     */
    @Relationship(type = "FOLLOWS", direction = Relationship.Direction.OUTGOING)
    private List<Account> accountList;

    /**
     * Publications where the account has made
     * a review.
     */
    @Relationship(type = "REVIEWED", direction = Relationship.Direction.OUTGOING)
    private List<Publication> publicationList;

}
