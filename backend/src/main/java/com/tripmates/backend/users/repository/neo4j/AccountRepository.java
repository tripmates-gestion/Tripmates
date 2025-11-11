package com.tripmates.backend.users.repository.neo4j;

import com.tripmates.backend.users.entity.neo4j.Account;
import org.springframework.data.neo4j.repository.Neo4jRepository;

public interface AccountRepository extends Neo4jRepository<Account, String> {
}
