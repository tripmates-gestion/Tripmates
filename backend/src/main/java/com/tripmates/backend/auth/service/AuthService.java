package com.tripmates.backend.auth.service;

import com.tripmates.backend.auth.dto.*;
import com.tripmates.backend.common.exception.ConflictException;
import com.tripmates.backend.auth.exception.ValidationErrorException;
import com.tripmates.backend.common.exception.NotFoundException;
import com.tripmates.backend.common.exception.UnauthorizedException;
import com.tripmates.backend.config.security.jwt.JwtService;
import com.tripmates.backend.config.security.jwt.UserDetailFromJwt;
import com.tripmates.backend.common.types.Role;
import com.tripmates.backend.users.entity.mongo.Account;
import com.tripmates.backend.users.entity.neo4j.AccountNode;
import com.tripmates.backend.users.repository.mongo.AccountRepository;
import com.tripmates.backend.common.constants.ValidationErrorMessage;

import com.tripmates.backend.users.repository.neo4j.AccountNodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {

	@Autowired
	private AccountRepository accountRepository;

	@Autowired
	private AccountNodeRepository accountNodeRepository;

	@Autowired
	private JwtService jwtService;

	@Autowired
	private PasswordEncoder passwordEncoder;

	/**
	 * Registers a user account in the system.
	 * @param authRegisterRequestDTO DTO with user's account register information.
	 */
	public void register(AuthRegisterRequestDTO authRegisterRequestDTO) {
		accountRepository.findByEmail(authRegisterRequestDTO.email()).ifPresent(account -> {
			throw new ConflictException(ValidationErrorMessage.USER_ALREADY_EXISTS);
		});

		Account account = new Account();

		checkBusinessType(authRegisterRequestDTO);

		account.setName(authRegisterRequestDTO.name());
		account.setEmail(authRegisterRequestDTO.email());
		account.setPassword(passwordEncoder.encode(authRegisterRequestDTO.password()));
		account.setRole(authRegisterRequestDTO.role());
		account.setBusinessType(authRegisterRequestDTO.businessType());

		accountRepository.save(account);
		accountNodeRepository.save(AccountNode.fromAccount(account));

		if (account.getRole() == Role.BUSINESS)
			accountNodeRepository.createSharesBusinessType(account.getId());
	}

	/**
	 * Logins an existing user account in the system.
	 * @param authLoginRequestDTO DTO with user's account login information.
	 * @return {@link AuthLoginResponseDTO}
	 */
	public AuthLoginResponseDTO login(AuthLoginRequestDTO authLoginRequestDTO) {
		Account account = accountRepository.findByEmail(authLoginRequestDTO.email())
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.INVALID_CREDENTIALS));

		if (!passwordEncoder.matches(authLoginRequestDTO.password(), account.getPassword()))
			throw new UnauthorizedException(ValidationErrorMessage.INVALID_CREDENTIALS);

		var accessToken = this.jwtService
			.generateAccessToken(new UserDetailFromJwt(account.getEmail(), account.getPassword()));

		var refreshToken = this.jwtService
			.generateRefreshToken(new UserDetailFromJwt(account.getEmail(), account.getPassword()));

		account.setToken(refreshToken);
		accountRepository.save(account);

		return new AuthLoginResponseDTO(accessToken, refreshToken);
	}

	/**
	 * Logouts an existing and active user account from the system.
	 * @param authLogoutRequestDTO DTO with user's account logout information.
	 */
	public void logout(AuthLogoutRequestDTO authLogoutRequestDTO) {
		Account account = accountRepository.findByEmail(authLogoutRequestDTO.email())
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.INVALID_CREDENTIALS));

		account.setToken(null);
		accountRepository.save(account);
	}

	/**
	 * Returns a new refresh token for the user.
	 * @param authRefreshRequestDTO DTO with user's account refresh information.
	 * @return {@link AuthRefreshResponseDTO }.
	 */
	public AuthRefreshResponseDTO refresh(AuthRefreshRequestDTO authRefreshRequestDTO) {
		Account user = accountRepository.findByEmail(authRefreshRequestDTO.email())
			.orElseThrow(() -> new NotFoundException(ValidationErrorMessage.INVALID_CREDENTIALS));

		if (!user.getToken().equals(authRefreshRequestDTO.refreshToken()))
			throw new UnauthorizedException(ValidationErrorMessage.INVALID_CREDENTIALS);

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