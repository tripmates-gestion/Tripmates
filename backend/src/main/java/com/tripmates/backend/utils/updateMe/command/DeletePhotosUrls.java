package com.tripmates.backend.utils.updateMe.command;

import java.util.List;

import com.tripmates.backend.common.constants.ValidationErrorMessage;
import com.tripmates.backend.common.exception.BadRequestException;
import com.tripmates.backend.common.exception.NotFoundException;
import com.tripmates.backend.common.service.storage.StorageService;
import com.tripmates.backend.common.types.Role;
import com.tripmates.backend.users.entity.mongo.Account;

public class DeletePhotosUrls implements AccountUpdateCommand {

	private final List<String> imageUrls;

	private final StorageService storageService;

	public DeletePhotosUrls(List<String> imageUrls, StorageService storageService) {
		this.imageUrls = imageUrls;
		this.storageService = storageService;
	}

	private void checkUrls(List<String> imageUrls, List<String> oldPhotosUrls) {
		for (String imageUrl : imageUrls) {
			if (!oldPhotosUrls.contains(imageUrl))
				throw new NotFoundException(ValidationErrorMessage.NOT_FOUND_IMAGE_URL);
		}
	}

	@Override
	public Account apply(Account account) {
		if (account.getRole() != Role.BUSINESS)
			throw new BadRequestException(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT);

		List<String> oldPhotosUrls = account.getProfileImageUrls();
		checkUrls(imageUrls, oldPhotosUrls);
		for (String imageUrl : imageUrls)
			storageService.deleteByUrl(imageUrl);

		oldPhotosUrls.removeAll(imageUrls);
		account.setProfileImageUrls(oldPhotosUrls);

		return account;
	}

}