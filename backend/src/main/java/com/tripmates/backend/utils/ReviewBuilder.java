package com.tripmates.backend.utils;


import java.util.ArrayList;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;
import com.tripmates.backend.users.entity.mongo.Account;
import com.tripmates.backend.common.service.storage.StorageService;
import com.tripmates.backend.common.exception.BadRequestException;
import com.tripmates.backend.publications.dto.ReviewCreationRequestDTO;
import com.tripmates.backend.common.types.Review;
import com.tripmates.backend.common.constants.ValidationErrorMessage;

public class ReviewBuilder {

	private ReviewCreationRequestDTO reviewCreationRequestDTO;
  private String publicationId;

	private final List<String> imageUrls = new ArrayList<>();

	private final StorageService storageService;

	private Account owner;

	public ReviewBuilder(StorageService storageService) {
		this.storageService = storageService;
	}

	public ReviewBuilder publicationDetails(ReviewCreationRequestDTO reviewCreationRequestDTO) {
		this.reviewCreationRequestDTO = reviewCreationRequestDTO;
		return this;
	}
  public ReviewBuilder publicationId(String publicationId) {
    this.publicationId = publicationId;
    return this;
  }

	public ReviewBuilder imageFiles(List<MultipartFile> imageFiles) {
		for (MultipartFile imageFile : imageFiles) {
			if (imageFile != null && !imageFile.isEmpty()) {
				String imageUrl = storageService.uploadFile(imageFile);
				imageUrls.add(imageUrl);
			}
			else {
				throw new BadRequestException(ValidationErrorMessage.IMAGE_FILES_BLANK);
			}
		}
		return this;
	}

	public ReviewBuilder owner(Account owner) {
		this.owner = owner;
		return this;
	}

	public Review build() {
		return new Review(
      publicationId,
      reviewCreationRequestDTO.title(),
			reviewCreationRequestDTO.content(),
      reviewCreationRequestDTO.rating(),
      imageUrls,
      owner.getId());
	}

}
