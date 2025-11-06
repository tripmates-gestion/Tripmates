package com.tripmates.backend.auth.service;

import com.tripmates.backend.auth.dto.*;
import com.tripmates.backend.auth.exception.IncorrectPasswordException;
import com.tripmates.backend.auth.exception.IncorrectTokenException;
import com.tripmates.backend.auth.exception.AccountAlreadyExistsException;
import com.tripmates.backend.auth.exception.AccountNotFoundException;
import com.tripmates.backend.auth.exception.ValidationErrorException;
import com.tripmates.backend.config.security.jwt.JwtService;
import com.tripmates.backend.config.security.jwt.UserDetailFromJwt;
import com.tripmates.backend.common.types.Role;
import com.tripmates.backend.users.entity.mongo.Account;
import com.tripmates.backend.users.repository.mongo.AccountRepository;
import com.tripmates.backend.common.constants.ValidationErrorMessage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {

	@Autowired
	private AccountRepository userRepository;

	@Autowired
	private JwtService jwtService;

	@Autowired
	private PasswordEncoder passwordEncoder;

	/**
	 * Registers a user account in the system.
	 * @param authRegisterRequestDTO DTO with user's account register information.
	 */
	public void register(AuthRegisterRequestDTO authRegisterRequestDTO) {
		userRepository.findByEmail(authRegisterRequestDTO.email()).ifPresent(account -> {
			throw new AccountAlreadyExistsException(ValidationErrorMessage.USER_ALREADY_EXISTS);
		});

		Account account = new Account();

		checkBusinessType(authRegisterRequestDTO);

		account.setName(authRegisterRequestDTO.name());
		account.setEmail(authRegisterRequestDTO.email());
		account.setPassword(passwordEncoder.encode(authRegisterRequestDTO.password()));
		account.setRole(authRegisterRequestDTO.role());
		account.setBusinessType(authRegisterRequestDTO.businessType());

		userRepository.save(account);
	}

	/**
	 * Logins an existing user account in the system.
	 * @param authLoginRequestDTO DTO with user's account login information.
	 * @return {@link AuthLoginResponseDTO}
	 */
	public AuthLoginResponseDTO login(AuthLoginRequestDTO authLoginRequestDTO) {
		Account account = userRepository.findByEmail(authLoginRequestDTO.email())
			.orElseThrow(() -> new AccountNotFoundException(ValidationErrorMessage.INVALID_CREDENTIALS));

		if (!passwordEncoder.matches(authLoginRequestDTO.password(), account.getPassword()))
			throw new IncorrectPasswordException(ValidationErrorMessage.INVALID_CREDENTIALS);

		var accessToken = this.jwtService
			.generateAccessToken(new UserDetailFromJwt(account.getEmail(), account.getPassword()));

		var refreshToken = this.jwtService
			.generateRefreshToken(new UserDetailFromJwt(account.getEmail(), account.getPassword()));

		account.setToken(refreshToken);
		userRepository.save(account);

		return new AuthLoginResponseDTO(accessToken, refreshToken);
	}

	/**
	 * Logouts an existing and active user account from the system.
	 * @param authLogoutRequestDTO DTO with user's account logout information.
	 */
	public void logout(AuthLogoutRequestDTO authLogoutRequestDTO) {
		Account account = userRepository.findByEmail(authLogoutRequestDTO.email())
			.orElseThrow(() -> new AccountNotFoundException(ValidationErrorMessage.INVALID_CREDENTIALS));

		account.setToken(null);
		userRepository.save(account);
	}

	/**
	 * Returns a new refresh token for the user.
	 * @param authRefreshRequestDTO DTO with user's account refresh information.
	 * @return {@link AuthRefreshResponseDTO }.
	 */
	public AuthRefreshResponseDTO refresh(AuthRefreshRequestDTO authRefreshRequestDTO) {
		Account user = userRepository.findByEmail(authRefreshRequestDTO.email())
			.orElseThrow(() -> new AccountNotFoundException(ValidationErrorMessage.INVALID_CREDENTIALS));

		if (!user.getToken().equals(authRefreshRequestDTO.refreshToken()))
			throw new IncorrectTokenException(ValidationErrorMessage.INVALID_CREDENTIALS);

		var accessToken = this.jwtService
			.generateAccessToken(new UserDetailFromJwt(user.getEmail(), user.getPassword()));

		return new AuthRefreshResponseDTO(accessToken);
	}

	/**
	 * Validates the user's role and business type.
	 * @param authRegisterRequestDTO DTO with user's role and business type.
	 */
	private void checkBusinessType(AuthRegisterRequestDTO authRegisterRequestDTO) {
		if (authRegisterRequestDTO.role() == Role.USER && authRegisterRequestDTO.businessType() != null)
			throw new ValidationErrorException(ValidationErrorMessage.FILD_NO_ALLOWED + "businessType");

		if (authRegisterRequestDTO.role() == Role.BUSINESS && authRegisterRequestDTO.businessType() == null)
			throw new ValidationErrorException(ValidationErrorMessage.EMPTY_OR_NULL_FIELD + "businessType");
	}

}