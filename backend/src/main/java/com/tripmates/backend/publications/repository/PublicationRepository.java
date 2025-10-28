package com.tripmates.backend.publications.repository;

import com.tripmates.backend.publications.entity.mongo.Publication;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PublicationRepository extends MongoRepository<Publication, String> {

	java.util.List<Publication> findByOwnerId(String ownerId);

}
