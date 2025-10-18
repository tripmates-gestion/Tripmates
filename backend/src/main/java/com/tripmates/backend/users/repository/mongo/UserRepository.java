package com.tripmates.backend.users.repository.mongo;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.tripmates.backend.users.entity.mongo.User;

/**
 * Representa las queries personalizadas que podemos realizar
 * sobre el documento de {@link com.tripmates.backend.users.entity.mongo.User User}
 * en MongoDB.
 *
 * @see org.springframework.data.mongodb.repository.MongoRepository
 * @see com.tripmates.backend.users.entity.mongo.User
 */
public interface UserRepository extends MongoRepository<User, String> {
    /**
     * Devuelve el usuario asociado al email.
     *
     * @param email del usuario.
     * @return usuario asociado a dicho email.
     */
    User findByEmail(String email);
}