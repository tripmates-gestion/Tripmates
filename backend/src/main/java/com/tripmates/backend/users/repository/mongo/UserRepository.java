package com.tripmates.backend.users.repository.mongo;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.tripmates.backend.users.entity.mongo.User;

import java.util.Optional;

/**
 * Representa las queries personalizadas que podemos realizar
 * sobre el documento de {@link com.tripmates.backend.users.entity.mongo.User User}
 * en MongoDB.
 *
 * @see org.springframework.data.mongodb.repository.MongoRepository
 * @see com.tripmates.backend.users.entity.mongo.User
 */
public interface UserRepository extends MongoRepository<User, String>, UserRepositoryCustom {
    /**
     * Devuelve el usuario asociado al email.
     *
     * @param email email del usuario.
     * @return {@link com.tripmates.backend.users.entity.mongo.User User} o Null.
     */
    Optional<User> findByEmail(String email);
}