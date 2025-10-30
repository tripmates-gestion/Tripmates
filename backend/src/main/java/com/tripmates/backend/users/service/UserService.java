package com.tripmates.backend.users.service;

import com.tripmates.backend.auth.exception.UserNotFoundException;
import com.tripmates.backend.common.service.storage.StorageService;
import com.tripmates.backend.users.dto.UserResumeResponseDTO;
import com.tripmates.backend.users.dto.UserSearchRequestDTO;
import com.tripmates.backend.users.dto.UserUpdateRequestDTO;
import com.tripmates.backend.users.entity.mongo.Account;
import com.tripmates.backend.users.repository.mongo.UserRepository;
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
	private UserRepository userRepository;

	@Autowired
	private StorageService storageService;

	/**
	 * Retorna un usuario
	 * 
	 * @param email email del usuario
	 * @return {@link com.tripmates.backend.users.entity.mongo.Account User}
	 */
	public UserResumeResponseDTO getUser(String email) {
		Account user = userRepository.findByEmail(email).orElseThrow(() -> new UserNotFoundException("User not found"));

		return UserResumeResponseDTO.fromUser(user);
	}

	// public UserResumeResponseDTO updateUser(String email, UserUpdateRequestDTO
	// userUpdateRequestDTO,
	// List<MultipartFile> imageFiles, MultipartFile avatar) {

	// Account user = userRepository.findByEmail(email).orElseThrow(() -> new
	// UserNotFoundException("User not found"));

	// if (userUpdateRequestDTO.name() != null)
	// user.setName(userUpdateRequestDTO.name());

	// if (userUpdateRequestDTO.description() != null)
	// user.setDescription(userUpdateRequestDTO.description());

	// if (userUpdateRequestDTO.avatarURL() != null) {
	// String previous = user.getAvatarURL();
	// String next = userUpdateRequestDTO.avatarURL();

	// if (previous != null && !previous.isBlank() && (!previous.equals(next)))
	// storageService.deleteByUrl(previous);

	// user.setAvatarURL(next);
	// }

	// if (userUpdateRequestDTO.openingDays() != null)
	// user.setOpeningDays(userUpdateRequestDTO.openingDays());

	// if (userUpdateRequestDTO.attentionSchedule() != null)
	// user.setAttentionSchedule(userUpdateRequestDTO.attentionSchedule());

	// if (userUpdateRequestDTO.exceptionalClosingDays() != null)
	// user.setExceptionalClosingDays(userUpdateRequestDTO.exceptionalClosingDays());

	// if (userUpdateRequestDTO.phoneNumber() != null)
	// user.setPhoneNumber(userUpdateRequestDTO.phoneNumber());

	// if (userUpdateRequestDTO.location() != null)
	// user.setLocation(userUpdateRequestDTO.location());

	// if (imageFiles != null && !imageFiles.isEmpty()) {
	// if (user.getProfileImageUrls() != null) {
	// for (String oldUrl : user.getProfileImageUrls()) {
	// if (oldUrl != null && !oldUrl.isBlank())
	// storageService.deleteByUrl(oldUrl);
	// }
	// }

	// List<String> urls = new ArrayList<>();
	// for (MultipartFile file : imageFiles) {
	// String url = storageService.uploadFile(file);
	// urls.add(url);
	// }

	// user.setProfileImageUrls(urls);

	// if (user.getAvatarURL() == null && !urls.isEmpty())
	// user.setAvatarURL(urls.getFirst());

	// } else if (userUpdateRequestDTO.profileImageUrls() != null) {
	// if (user.getProfileImageUrls() != null) {
	// for (String oldUrl : user.getProfileImageUrls()) {
	// if (oldUrl != null && !oldUrl.isBlank())
	// storageService.deleteByUrl(oldUrl);
	// }
	// }

	// user.setProfileImageUrls(userUpdateRequestDTO.profileImageUrls());
	// }

	// if (avatar != null && !avatar.isEmpty()) {
	// String previous = user.getAvatarURL();
	// if (previous != null && !previous.isBlank())
	// storageService.deleteByUrl(previous);

	// String avatarUrl = storageService.uploadFile(avatar);
	// user.setAvatarURL(avatarUrl);
	// }

	// userRepository.save(user);

	// return new UserResumeResponseDTO(user.getName(), user.getEmail(),
	// user.getRole(), user.getDescription(),
	// user.getAvatarURL(), user.getBusinessType(), user.getOpeningDays(),
	// user.getAttentionSchedule(),
	// user.getExceptionalClosingDays(), user.getPhoneNumber(), user.getLocation(),
	// user.getProfileImageUrls());
	// }

	/**
	 * Retorna una page con los usuarios que cumplen con los filtros especificados.
	 * 
	 * @param userSearchRequestDTO dto que contiene los filtros de busqueda.
	 * @param pageable             configuración de pages a retornar
	 * @return {@link Page}
	 */
	public Page<UserResumeResponseDTO> search(UserSearchRequestDTO userSearchRequestDTO, Pageable pageable) {
		return userRepository
				.searchUsers(userSearchRequestDTO.username(), userSearchRequestDTO.role(),
						userSearchRequestDTO.location(),
						userSearchRequestDTO.businessType(), pageable)
				.map(UserResumeResponseDTO::fromUser);
	}

}
