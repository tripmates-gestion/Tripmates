package com.tripmates.backend.auth.service;

import com.tripmates.backend.auth.dto.*;
import com.tripmates.backend.auth.entity.mongo.PasswordResetCode;
import com.tripmates.backend.auth.repository.mongo.PasswordResetCodeRepository;
import com.tripmates.backend.common.exception.BadRequestException;
import com.tripmates.backend.common.exception.ConflictException;
import com.tripmates.backend.auth.exception.ValidationErrorException;
import com.tripmates.backend.common.exception.NotFoundException;
import com.tripmates.backend.common.exception.UnauthorizedException;
import com.tripmates.backend.config.security.jwt.JwtService;
import com.tripmates.backend.config.security.jwt.UserDetailFromJwt;
import com.tripmates.backend.common.types.Role;
import com.tripmates.backend.common.service.email.EmailService;
import com.tripmates.backend.users.entity.mongo.Account;
import com.tripmates.backend.users.entity.neo4j.AccountNode;
import com.tripmates.backend.users.repository.mongo.AccountRepository;
import com.tripmates.backend.common.constants.ValidationErrorMessage;

import com.tripmates.backend.users.repository.neo4j.AccountNodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.Map;
import java.util.Random;

@Service
@Transactional
public class AuthService {

	@Autowired
	private AccountRepository accountRepository;

	@Autowired
	private AccountNodeRepository accountNodeRepository;

	@Autowired
	private PasswordResetCodeRepository passwordResetCodeRepository;

	@Autowired
	private EmailService emailService;

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

	/**
	 * Generates a random 6-digit code.
	 * @return 6-digit code as String.
	 */
	private String generateResetCode() {
		Random random = new Random();
		int code = 100000 + random.nextInt(900000);
		return String.valueOf(code);
	}

	/**
	 * Requests a password reset for a user account.
	 * @param requestPasswordResetDTO DTO with user's email.
	 */
	public void requestPasswordReset(RequestPasswordResetDTO requestPasswordResetDTO) {
		Account account = accountRepository.findByEmail(requestPasswordResetDTO.email())
			.orElseThrow(() -> new BadRequestException(ValidationErrorMessage.USER_NOT_FOUND));

		String resetCode = generateResetCode();
		PasswordResetCode passwordResetCode = new PasswordResetCode(account.getEmail(), resetCode);
		passwordResetCodeRepository.save(passwordResetCode);

		emailService.sendHtmlPasswordResetEmail(account.getEmail(), "Restablecimiento de Contraseña - Tripmates",
				resetCode);
	}

	/**
	 * Verifies a password reset code.
	 * @param verifyResetCodeDTO DTO with user's email and reset code.
	 */
	public void verifyResetCode(VerifyResetCodeDTO verifyResetCodeDTO) {
		PasswordResetCode resetCode = passwordResetCodeRepository
			.findByEmailAndCodeAndUsed(verifyResetCodeDTO.email(), verifyResetCodeDTO.code(), false)
			.orElseThrow(() -> new BadRequestException(ValidationErrorMessage.INVALID_CREDENTIALS));

		// Check if code is expired (15 minutes)
		long fifteenMinutesInMillis = 15 * 60 * 1000;
		Date now = new Date();
		if (now.getTime() - resetCode.getCreatedAt().getTime() > fifteenMinutesInMillis) {
			throw new BadRequestException("El código de restablecimiento ha expirado");
		}
	}

	/**
	 * Resets a user's password using a reset code.
	 * @param resetPasswordDTO DTO with user's email, reset code and new password.
	 */
	public void resetPassword(ResetPasswordDTO resetPasswordDTO) {
		Account account = accountRepository.findByEmail(resetPasswordDTO.email())
			.orElseThrow(() -> new BadRequestException(ValidationErrorMessage.USER_NOT_FOUND));

		PasswordResetCode resetCode = passwordResetCodeRepository
			.findByEmailAndCodeAndUsed(resetPasswordDTO.email(), resetPasswordDTO.code(), false)
			.orElseThrow(() -> new BadRequestException(ValidationErrorMessage.INVALID_CREDENTIALS));

		// Check if code is expired (15 minutes)
		long fifteenMinutesInMillis = 15 * 60 * 1000;
		Date now = new Date();
		if (now.getTime() - resetCode.getCreatedAt().getTime() > fifteenMinutesInMillis) {
			throw new BadRequestException("El código de restablecimiento ha expirado");
		}

		// Mark code as used
		resetCode.setUsed(true);
		passwordResetCodeRepository.save(resetCode);

		// Update password
		account.setPassword(passwordEncoder.encode(resetPasswordDTO.newPassword()));
		accountRepository.save(account);
	}

}