package com.tripmates.backend.publications.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.tripmates.backend.publications.entity.mongo.Publication;

public interface PublicationRepository extends MongoRepository<Publication, String> {
    java.util.List<Publication> findByOwnerId(String ownerId);
}
