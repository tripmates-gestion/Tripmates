package com.tripmates.backend.users.service;

import com.tripmates.backend.config.security.jwt.JwtService;
import com.tripmates.backend.config.security.jwt.UserDetailFromJwt;
import com.tripmates.backend.users.dto.UserCreationResponseDTO;
import com.tripmates.backend.users.dto.UserCreationRequestDTO;
import com.tripmates.backend.users.dto.UserProfileResponseDTO;
import com.tripmates.backend.users.entity.mongo.User;
import com.tripmates.backend.users.repository.mongo.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Service
@Transactional
public class UserService {

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

        user.setUsername(userCreationRequestDTO.username());
        user.setEmail(userCreationRequestDTO.email());
        user.setPassword(passwordEncoder.encode(userCreationRequestDTO.password()));
        user.setRole(userCreationRequestDTO.role());
        user.setDescription(userCreationRequestDTO.description());
        user.setAvatarURL(userCreationRequestDTO.avatarURL()); // <-- Nuevo campo

        var accessToken = jwtService.generateAccessToken(
                new UserDetailFromJwt(user.getEmail(), user.getPassword())
        );

        var refreshToken = jwtService.generateRefreshToken(
                new UserDetailFromJwt(user.getEmail(), user.getPassword())
        );

        user.setToken(refreshToken);
        userRepository.save(user);

        return new UserCreationResponseDTO(accessToken, refreshToken);
    }

    /**
     * Obtiene el perfil de un usuario a partir de su email o nombre de usuario.
     *
     * @param emailOrUsername Email o nombre de usuario.
     * @return DTO con la información del perfil.
     */
    public UserProfileResponseDTO getProfile(String emailOrUsername) {
        var user = userRepository.findByEmail(emailOrUsername)
                .orElseGet(() -> userRepository.findByUsername(emailOrUsername)
                        .orElseThrow(() -> new NoSuchElementException("User not found")));

        return new UserProfileResponseDTO(user);
    }
}
