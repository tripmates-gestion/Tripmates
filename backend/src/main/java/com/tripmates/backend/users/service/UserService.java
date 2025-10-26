package com.tripmates.backend.users.service;

import com.tripmates.backend.auth.exception.UserNotFoundException;
import com.tripmates.backend.users.dto.UserUpdateResponseDTO;
import com.tripmates.backend.users.dto.UserUpdateRequestDTO;
import com.tripmates.backend.users.entity.mongo.User;
import com.tripmates.backend.users.repository.mongo.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Retorna un usuario
     *
     * @param email email del usuario
     * @return {@link com.tripmates.backend.users.entity.mongo.User User}
     */
    public User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    public UserUpdateResponseDTO updateUser(
            String email,
            UserUpdateRequestDTO userUpdateRequestDTO
    ) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (userUpdateRequestDTO.username() != null) {
            user.setUsername(userUpdateRequestDTO.username());
        }
        if (userUpdateRequestDTO.description() != null) {
            user.setDescription(userUpdateRequestDTO.description());
        }
        if (userUpdateRequestDTO.avatarURL() != null) {
            user.setAvatarURL(userUpdateRequestDTO.avatarURL());
        }

        userRepository.save(user);

        return new UserUpdateResponseDTO(
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getDescription(),
                user.getAvatarURL() // Corregido: usar avatarURL en lugar de username
        );
    }
}
