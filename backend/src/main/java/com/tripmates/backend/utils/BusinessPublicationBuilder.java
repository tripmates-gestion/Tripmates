package com.tripmates.backend.utils;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;
import com.tripmates.backend.publications.dto.BusinessPublicationRequestDTO;
import com.tripmates.backend.users.entity.mongo.Account;
import com.tripmates.backend.publications.entity.mongo.Publication;
import com.tripmates.backend.common.service.storage.StorageService;
import com.tripmates.backend.common.constants.ValidationErrorMessage;
import com.tripmates.backend.common.exception.BadRequestException;

public class BusinessPublicationBuilder {

	private BusinessPublicationRequestDTO businessPublicationDTO;

	private final List<String> imageUrls = new ArrayList<>();

	private final StorageService storageService;

	private Account owner;

	public BusinessPublicationBuilder(StorageService storageService) {
		this.storageService = storageService;
	}

	public BusinessPublicationBuilder publicationDetails(BusinessPublicationRequestDTO businessPublicationDTO) {
		this.businessPublicationDTO = businessPublicationDTO;
		return this;
	}

	public BusinessPublicationBuilder imageFiles(List<MultipartFile> imageFiles) {
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

	public BusinessPublicationBuilder owner(Account owner) {
		this.owner = owner;
		return this;
	}

	public Publication build() {

		return new Publication(businessPublicationDTO.title(), businessPublicationDTO.description(),
				businessPublicationDTO.openingDays(), businessPublicationDTO.attentionSchedule(),
				businessPublicationDTO.exceptionalClosingDays(), businessPublicationDTO.phoneNumber(),
				businessPublicationDTO.email(), businessPublicationDTO.location(), businessPublicationDTO.tags(),
				imageUrls, owner.getId(), owner.getName(), owner.getAvatarURL(), new Date());
	}

}
