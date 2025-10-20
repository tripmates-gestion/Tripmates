package com.tripmates.backend.auth.service;

import com.tripmates.backend.auth.dto.AuthLoginRequestDTO;
import com.tripmates.backend.auth.dto.AuthLoginResponseDTO;
import com.tripmates.backend.auth.exception.IncorrectPasswordException;
import com.tripmates.backend.auth.exception.UserNotFoundException;
import com.tripmates.backend.config.security.jwt.JwtService;
import com.tripmates.backend.config.security.jwt.UserDetailFromJwt;
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

    public AuthLoginResponseDTO login(AuthLoginRequestDTO authLoginRequestDTO) {
        User user = userRepository.findByEmail(authLoginRequestDTO.email())
                .orElseThrow(() -> new UserNotFoundException("Invalid credentials"));

        if (!passwordEncoder.matches(authLoginRequestDTO.password(), user.getPassword())) {
            throw new IncorrectPasswordException("Invalid credentials");
        }

        var accessToken = this.jwtService.generateAccessToken(
                new UserDetailFromJwt(user.getEmail(), user.getPassword())
        );

        var refreshToken = this.jwtService.generateRefreshToken(
                new UserDetailFromJwt(user.getEmail(), user.getPassword())
        );

        user.setToken(refreshToken);
        userRepository.save(user);

        return new AuthLoginResponseDTO(accessToken, refreshToken);
    }
}
