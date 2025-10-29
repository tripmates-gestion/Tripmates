package com.tripmates.backend.auth.service;

import com.tripmates.backend.auth.dto.*;
import com.tripmates.backend.auth.exception.IncorrectPasswordException;
import com.tripmates.backend.auth.exception.IncorrectTokenException;
import com.tripmates.backend.auth.exception.UserAlreadyExistsException;
import com.tripmates.backend.auth.exception.UserNotFoundException;
import com.tripmates.backend.auth.exception.ValidationErrorException;
import com.tripmates.backend.config.security.jwt.JwtService;
import com.tripmates.backend.config.security.jwt.UserDetailFromJwt;
import com.tripmates.backend.users.entity.Role;
import com.tripmates.backend.users.entity.mongo.User;
import com.tripmates.backend.users.repository.mongo.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tripmates.backend.common.constants.ValidationErrorMessage;

@Service
@Transactional
public class AuthService {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private JwtService jwtService;

	@Autowired
	private PasswordEncoder passwordEncoder;

	/**
	 * Crea un nuevo usuario y lo persiste en la base de datos MongoDB
	 * @param authRegisterRequestDTO contiene los datos del nuevo usuario
	 */
	public void register(AuthRegisterRequestDTO authRegisterRequestDTO) {
		User user = new User();
		userRepository.findByEmail(authRegisterRequestDTO.email()).ifPresent(u -> {
			throw new UserAlreadyExistsException("Email no está disponible");
		});
		checkBusinessType(authRegisterRequestDTO);

		user.setName(authRegisterRequestDTO.name());
		user.setEmail(authRegisterRequestDTO.email());
		user.setPassword(passwordEncoder.encode(authRegisterRequestDTO.password()));
		user.setRole(authRegisterRequestDTO.role());
		user.setBusinessType(authRegisterRequestDTO.businessType());
		userRepository.save(user);
	}

	/**
	 * Genera un access y refresh token para el usuario, persiste en la base de datos el
	 * refresh token generado
	 * @param authLoginRequestDTO contiene email y password
	 * @return {@link AuthLoginResponseDTO AuthLoginResponseDTO}
	 */
	public AuthLoginResponseDTO login(AuthLoginRequestDTO authLoginRequestDTO) {
		User user = userRepository.findByEmail(authLoginRequestDTO.email())
			.orElseThrow(() -> new UserNotFoundException("Credenciales invalidas"));

		if (!passwordEncoder.matches(authLoginRequestDTO.password(), user.getPassword())) {
			throw new IncorrectPasswordException("Credenciales invalidas");
		}

		var accessToken = this.jwtService
			.generateAccessToken(new UserDetailFromJwt(user.getEmail(), user.getPassword()));

		var refreshToken = this.jwtService
			.generateRefreshToken(new UserDetailFromJwt(user.getEmail(), user.getPassword()));

		user.setToken(refreshToken);
		userRepository.save(user);

		return new AuthLoginResponseDTO(accessToken, refreshToken);
	}

	/**
	 * Elimina el refresh token persistido en la base de datos, del usuario
	 * @param authLogoutRequestDTO contiene email
	 */
	public void logout(AuthLogoutRequestDTO authLogoutRequestDTO) {
		User user = userRepository.findByEmail(authLogoutRequestDTO.email())
			.orElseThrow(() -> new UserNotFoundException("Credenciales invalidas"));

		user.setToken(null);
		userRepository.save(user);
	}

	/**
	 * Retorna un nuevo access token para el usuario
	 * @param authRefreshRequestDTO contiene email y refresh token
	 * @return {@link AuthRefreshResponseDTO AuthRefreshResponseDTO}
	 */
	public AuthRefreshResponseDTO refresh(AuthRefreshRequestDTO authRefreshRequestDTO) {
		User user = userRepository.findByEmail(authRefreshRequestDTO.email())
			.orElseThrow(() -> new UserNotFoundException("Credenciales invalidas"));

		if (!user.getToken().equals(authRefreshRequestDTO.refreshToken())) {
			throw new IncorrectTokenException("Credenciales invalidas");
		}

		var accessToken = this.jwtService
			.generateAccessToken(new UserDetailFromJwt(user.getEmail(), user.getPassword()));

		return new AuthRefreshResponseDTO(accessToken);
	}

	private void checkBusinessType(AuthRegisterRequestDTO authRegisterRequestDTO) {
		if (authRegisterRequestDTO.role() == Role.USER && authRegisterRequestDTO.businessType() != null)
			throw new ValidationErrorException(ValidationErrorMessage.FILD_NO_ALLOWED + "businessType");

		if (authRegisterRequestDTO.role() == Role.BUSINESS && authRegisterRequestDTO.businessType() == null)
			throw new ValidationErrorException(ValidationErrorMessage.EMPTY_OR_NULL_FIELD + "businessType");
	}

}