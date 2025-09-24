package com.tripmates.backend.repository.mongo;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.tripmates.backend.entity.mongo.User;

public interface UserRepository extends MongoRepository<User, String> {
    User findByEmail(String email);
}