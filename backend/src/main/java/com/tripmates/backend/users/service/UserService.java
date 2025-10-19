package com.tripmates.backend.users.service;

import com.tripmates.backend.config.security.jwt.JwtService;
import com.tripmates.backend.config.security.jwt.UserDetailFromJwt;
import com.tripmates.backend.users.dto.UserCreationResponseDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.tripmates.backend.users.dto.UserCreationRequestDTO;
import com.tripmates.backend.users.entity.mongo.User;
import com.tripmates.backend.users.repository.mongo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;

@Service
@Transactional
public class UserService {

    /**
     * Manejador de queries sobre el documento de MongoDB.
     */
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    /**
     * Crea un nuevo usuario y lo persiste en el documento de MongoDB.
     *
     * @param userCreationRequestDTO dto para parseo y validación de JSON.
     * @return el usuario persistido.
     */
    public UserCreationResponseDTO createUser(UserCreationRequestDTO userCreationRequestDTO) {
        var user = new User();
        user.setEmail(userCreationRequestDTO.email());
        user.setPassword(userCreationRequestDTO.password());
        user.setRole(userCreationRequestDTO.role());

        var accessToken = this.jwtService.generateAccessToken(
                new UserDetailFromJwt(user.getEmail(), user.getPassword())
        );

        var refreshToken = this.jwtService.generateRefreshToken(
                new UserDetailFromJwt(user.getEmail(), user.getPassword())
        );

        user.setToken(refreshToken);

        userRepository.save(user);

        return new UserCreationResponseDTO(accessToken, refreshToken);
    }
}
