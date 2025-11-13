package com.tripmates.backend.users.repository.neo4j;

import com.tripmates.backend.users.entity.neo4j.AccountNode;
import org.springframework.data.neo4j.repository.Neo4jRepository;

public interface AccountNodeRepository extends Neo4jRepository<AccountNode, String> {

}
