package com.tripmates.backend.users.service;

import com.tripmates.backend.users.entity.Role;
import com.tripmates.backend.auth.exception.UserNotFoundException;
import com.tripmates.backend.common.constants.ValidationErrorMessage;
import com.tripmates.backend.common.exception.BadRequestException;
import com.tripmates.backend.common.service.storage.StorageService;
import com.tripmates.backend.common.types.BusinessType;
import com.tripmates.backend.users.dto.AccountResumeResponseDTO;
import com.tripmates.backend.users.dto.UserSearchRequestDTO;
import com.tripmates.backend.users.dto.UserUpdateRequestDTO;
import com.tripmates.backend.users.entity.mongo.Account;
import com.tripmates.backend.users.repository.mongo.AccountRespository;
import com.tripmates.backend.utils.updateMe.command.AccountUpdateCommand;

import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
public class UserService {

	@Autowired
	private AccountRespository userRepository;

	@Autowired
	private StorageService storageService;

	/**
	 * Retorna un usuario
	 * 
	 * @param email email del usuario
	 * @return {@link com.tripmates.backend.users.entity.mongo.Account User}
	 */
	public AccountResumeResponseDTO getUser(String email) {
		Account user = userRepository.findByEmail(email).orElseThrow(() -> new UserNotFoundException("User not found"));

		return AccountResumeResponseDTO.fromAccount(user);
	}

	public AccountResumeResponseDTO updateUser(String email, UserUpdateRequestDTO userUpdateRequestDTO,
			List<MultipartFile> imageFiles, MultipartFile avatar) {
		List<AccountUpdateCommand> commands = userUpdateRequestDTO.toCommands();
		Account account = userRepository.findByEmail(email)
				.orElseThrow(() -> new UserNotFoundException(ValidationErrorMessage.USER_NOT_FOUND));
		for (AccountUpdateCommand command : commands) {
			account = command.apply(account);
		}
		updateAvatar(account, avatar);
		updateProfileImages(account, imageFiles);
		account = userRepository.save(account);
		return AccountResumeResponseDTO.fromAccount(account);
	}

	/**
	 * Retorna una page con los usuarios que cumplen con los filtros especificados.
	 * 
	 * @param userSearchRequestDTO dto que contiene los filtros de busqueda.
	 * @param pageable             configuración de pages a retornar
	 * @return {@link Page}
	 */
	public Page<AccountResumeResponseDTO> search(UserSearchRequestDTO userSearchRequestDTO, Pageable pageable) {
		return userRepository
				.searchUsers(userSearchRequestDTO.username(), userSearchRequestDTO.role(),
						userSearchRequestDTO.location(),
						userSearchRequestDTO.businessType(), pageable)
				.map(AccountResumeResponseDTO::fromAccount);
	}

	private void updateAvatar(Account account, MultipartFile avatar) {
		if (avatar == null || avatar.isEmpty() || avatar.getSize() == 0) {
			return;
		}
		String newAvatarUrl = storageService.uploadFile(avatar);
		String oldAvatarUrl = account.getAvatarURL();
		if (oldAvatarUrl != null) {
			storageService.deleteByUrl(oldAvatarUrl);
		}
		account.setAvatarURL(newAvatarUrl);
	}

	private void updateProfileImages(Account account, List<MultipartFile> imageFiles) {
		if (imageFiles == null || imageFiles.isEmpty()) {
			return;
		}
		if (account.getRole() != Role.BUSINESS) {
			throw new BadRequestException(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT);
		}

		List<String> newImageUrls = new ArrayList<>();
		for (MultipartFile imageFile : imageFiles) {
			String newImageUrl = storageService.uploadFile(imageFile);
			newImageUrls.add(newImageUrl);
		}

		List<String> oldImageUrls = account.getProfileImageUrls();
		if (oldImageUrls != null) {
			for (String oldImageUrl : oldImageUrls) {
				storageService.deleteByUrl(oldImageUrl);
			}
		}
		account.setProfileImageUrls(newImageUrls);
	}

}
