package com.tripmates.backend.users.service;

import com.tripmates.backend.common.types.Role;
import com.tripmates.backend.auth.exception.UserNotFoundException;
import com.tripmates.backend.common.constants.ValidationErrorMessage;
import com.tripmates.backend.common.exception.BadRequestException;
import com.tripmates.backend.common.service.storage.StorageService;
import com.tripmates.backend.users.dto.AccountResumeResponseDTO;
import com.tripmates.backend.users.dto.AccountSearchRequestDTO;
import com.tripmates.backend.users.dto.UserUpdateRequestDTO;
import com.tripmates.backend.users.entity.mongo.Account;
import com.tripmates.backend.users.repository.mongo.AccountRespository;
import com.tripmates.backend.utils.updateMe.command.AccountUpdateCommand;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class UserService {

	@Autowired
	private AccountRespository accountRespository;

	@Autowired
	private StorageService storageService;

	/**
	 * Retorna un usuario asociado al email.
	 * @param email email del usuario.
	 * @return {@link Account User}
	 */
	public AccountResumeResponseDTO getUser(String email) {
		Account user = accountRespository.findByEmail(email)
			.orElseThrow(() -> new UserNotFoundException("User not found"));

		return AccountResumeResponseDTO.fromAccount(user);
	}

	/**
	 * @param email
	 * @param userUpdateRequestDTO
	 * @param imageFiles
	 * @param avatar
	 * @return
	 */
	public AccountResumeResponseDTO updateUser(String email, UserUpdateRequestDTO userUpdateRequestDTO,
			List<MultipartFile> imageFiles, MultipartFile avatar) {
		List<AccountUpdateCommand> commands = userUpdateRequestDTO.toCommands(storageService);
		Account account = accountRespository.findByEmail(email)
			.orElseThrow(() -> new UserNotFoundException(ValidationErrorMessage.USER_NOT_FOUND));
		for (AccountUpdateCommand command : commands)
			account = command.apply(account);

		updateAvatar(account, avatar);
		updateProfileImages(account, imageFiles);

		return AccountResumeResponseDTO.fromAccount(accountRespository.save(account));
	}

	/**
	 * Retorna una page con los usuarios que cumplen con los filtros especificados.
	 * @param accountSearchRequestDTO dto que contiene los filtros de busqueda.
	 * @param pageable configuración de pages a retornar
	 * @return {@link Page}
	 */
	public Page<AccountResumeResponseDTO> search(AccountSearchRequestDTO accountSearchRequestDTO, Pageable pageable) {
		return accountRespository.searchAccount(accountSearchRequestDTO, pageable)
			.map(AccountResumeResponseDTO::fromAccount);
	}

	/**
	 * @param account
	 * @param avatar
	 */
	private void updateAvatar(Account account, MultipartFile avatar) {
		if (avatar == null || avatar.isEmpty() || avatar.getSize() == 0)
			return;

		String newAvatarUrl = storageService.uploadFile(avatar);
		String oldAvatarUrl = account.getAvatarURL();

		if (oldAvatarUrl != null)
			storageService.deleteByUrl(oldAvatarUrl);

		account.setAvatarURL(newAvatarUrl);
	}

	/**
	 * @param account
	 * @param imageFiles
	 */
	private void updateProfileImages(Account account, List<MultipartFile> imageFiles) {
		if (imageFiles == null || imageFiles.isEmpty())
			return;

		if (account.getRole() != Role.BUSINESS)
			throw new BadRequestException(ValidationErrorMessage.NOT_BUSINESS_ACCOUNT);

		List<String> oldImageUrls = account.getProfileImageUrls();
		List<String> imageUrls = oldImageUrls != null ? oldImageUrls : new ArrayList<>();
		for (MultipartFile imageFile : imageFiles) {
			String newImageUrl = storageService.uploadFile(imageFile);
			imageUrls.add(newImageUrl);
		}

		account.setProfileImageUrls(imageUrls);
	}

}
