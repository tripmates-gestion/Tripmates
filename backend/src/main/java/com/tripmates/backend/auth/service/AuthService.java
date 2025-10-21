package com.tripmates.backend.auth.service;

import com.tripmates.backend.auth.dto.*;
import com.tripmates.backend.auth.exception.IncorrectPasswordException;
import com.tripmates.backend.auth.exception.IncorrectTokenException;
import com.tripmates.backend.auth.exception.UserAlreadyExistingException;
import com.tripmates.backend.auth.exception.UserNotFoundException;
import com.tripmates.backend.config.security.jwt.JwtService;
import com.tripmates.backend.config.security.jwt.UserDetailFromJwt;
import com.tripmates.backend.users.dto.UserCreationRequestDTO;
import com.tripmates.backend.users.dto.UserCreationResponseDTO;
import com.tripmates.backend.users.entity.mongo.User;
import com.tripmates.backend.users.repository.mongo.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
     * Crea un nuevo usuario y lo persiste en la base de datos MongoDB.
     *
     * @param userCreationRequestDTO dto con los datos del nuevo usuario.
     * @return DTO con los tokens generados para el usuario.
     */
    public UserCreationResponseDTO createUser(UserCreationRequestDTO userCreationRequestDTO) {
        var user = new User();
        if (userRepository.findByEmail(userCreationRequestDTO.email()).isPresent()) {
            throw new UserAlreadyExistingException("Email already in use");
        }
        user.setUsername(userCreationRequestDTO.username());
        user.setEmail(userCreationRequestDTO.email());
        user.setPassword(passwordEncoder.encode(userCreationRequestDTO.password()));
        user.setRole(userCreationRequestDTO.role());
        user.setDescription(userCreationRequestDTO.description());
        user.setAvatarURL(userCreationRequestDTO.avatarURL());

        var accessToken = jwtService.generateAccessToken(
                new UserDetailFromJwt(user.getEmail(), user.getPassword()));

        var refreshToken = jwtService.generateRefreshToken(
                new UserDetailFromJwt(user.getEmail(), user.getPassword()));

        user.setToken(refreshToken);
        userRepository.save(user);

        return new UserCreationResponseDTO(accessToken, refreshToken);
    }

    /**
     * Genera un access y refresh token para el usuario,
     * persiste en la base de datos el refresh token generado
     *
     * @param authLoginRequestDTO contiene email y password
     * @return {@link com.tripmates.backend.auth.dto.AuthLoginResponseDTO
     *         AuthLoginResponseDTO}
     */
    public AuthLoginResponseDTO login(AuthLoginRequestDTO authLoginRequestDTO) {
        User user = userRepository.findByEmail(authLoginRequestDTO.email())
                .orElseThrow(() -> new UserNotFoundException("Invalid credentials"));

        if (!passwordEncoder.matches(authLoginRequestDTO.password(), user.getPassword())) {
            throw new IncorrectPasswordException("Invalid credentials");
        }

        var accessToken = this.jwtService.generateAccessToken(
                new UserDetailFromJwt(user.getEmail(), user.getPassword()));

        var refreshToken = this.jwtService.generateRefreshToken(
                new UserDetailFromJwt(user.getEmail(), user.getPassword()));

        user.setToken(refreshToken);
        userRepository.save(user);

        return new AuthLoginResponseDTO(accessToken, refreshToken);
    }

    /**
     * Elimina el refresh token persistido en la base de datos,
     * del usuario
     *
     * @param authLogoutRequestDTO contiene email
     * @return {@link com.tripmates.backend.auth.dto.AuthLogoutRequestDTO
     *         AuthLogoutRequestDTO}
     */
    public AuthLogoutResponseDTO logout(AuthLogoutRequestDTO authLogoutRequestDTO) {
        User user = userRepository.findByEmail(authLogoutRequestDTO.email())
                .orElseThrow(() -> new UserNotFoundException("Invalid credentials"));

        user.setToken(null);
        userRepository.save(user);

        return new AuthLogoutResponseDTO();
    }

    /**
     * Retorna un nuevo access token para el usuario
     *
     * @param authRefreshRequestDTO contiene email y refresh token
     * @return {@link com.tripmates.backend.auth.dto.AuthRefreshResponseDTO
     *         AuthRefreshResponseDTO}
     */
    public AuthRefreshResponseDTO refresh(AuthRefreshRequestDTO authRefreshRequestDTO) {
        User user = userRepository.findByEmail(authRefreshRequestDTO.email())
                .orElseThrow(() -> new UserNotFoundException("Invalid credentials"));

        if (!user.getToken().equals(authRefreshRequestDTO.refreshToken())) {
            throw new IncorrectTokenException("Invalid credentials");
        }

        var accessToken = this.jwtService.generateAccessToken(
                new UserDetailFromJwt(user.getEmail(), user.getPassword()));

        return new AuthRefreshResponseDTO(accessToken);
    }
}
