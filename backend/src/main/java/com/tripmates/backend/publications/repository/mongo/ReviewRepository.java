package com.tripmates.backend.publications.repository.mongo;

import java.util.List;

import com.tripmates.backend.common.types.Review;

public interface ReviewRepository {

	List<Review> findByOwnerId(String ownerId);

}
