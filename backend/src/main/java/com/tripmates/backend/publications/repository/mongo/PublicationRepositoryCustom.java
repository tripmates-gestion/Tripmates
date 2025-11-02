package com.tripmates.backend.publications.repository.mongo;

import com.tripmates.backend.publications.entity.mongo.Publication;
import com.tripmates.backend.publications.dto.PublicationSearchRequestDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PublicationRepositoryCustom {

	/**
	 * Search publications by optional filters. If no filters are provided, returns all.
	 */
	Page<Publication> search(PublicationSearchRequestDTO filters, Pageable pageable);

}
