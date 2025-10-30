package com.tripmates.backend.users.service;

import com.tripmates.backend.auth.exception.UserNotFoundException;
import com.tripmates.backend.common.constants.ValidationErrorMessage;
import com.tripmates.backend.common.service.storage.StorageService;
import com.tripmates.backend.users.dto.UserResumeResponseDTO;
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
	public UserResumeResponseDTO getUser(String email) {
		Account user = userRepository.findByEmail(email).orElseThrow(() -> new UserNotFoundException("User not found"));

		return UserResumeResponseDTO.fromUser(user);
	}

	public UserResumeResponseDTO updateUser(String email, UserUpdateRequestDTO userUpdateRequestDTO,
			List<MultipartFile> imageFiles, MultipartFile avatar) {
		List<AccountUpdateCommand> commands = userUpdateRequestDTO.toCommands();
		Account account = userRepository.findByEmail(email)
				.orElseThrow(() -> new UserNotFoundException(ValidationErrorMessage.USER_NOT_FOUND));
		System.out.println("la cuenta antes de editar " + account);
		for (AccountUpdateCommand command : commands) {
			account = command.apply(account);
		}

		account = userRepository.save(account);
		return UserResumeResponseDTO.fromUser(account);
	}

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
