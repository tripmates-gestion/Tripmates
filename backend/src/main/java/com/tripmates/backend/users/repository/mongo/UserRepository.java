package com.tripmates.backend.users.repository.mongo;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.tripmates.backend.users.entity.mongo.User;

public interface UserRepository extends MongoRepository<User, String> {
    User findByEmail(String email);
}