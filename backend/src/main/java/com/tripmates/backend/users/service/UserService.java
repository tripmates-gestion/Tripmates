package com.tripmates.backend.users.service;

import com.tripmates.backend.auth.exception.UserNotFoundException;
import com.tripmates.backend.users.dto.UserUpdateProfileResponseDTO;
import com.tripmates.backend.users.dto.UserUpdateDescriptionRequestDTO;
import com.tripmates.backend.users.dto.UserUpdateUsernameRequestDTO;
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

    /**
     * Actualiza la descripción de un ususario
     *
     * @param email email del usuario
     * @param userUpdateDescriptionRequestDTO dto con argumentos del request
     * @return {@link com.tripmates.backend.users.dto.UserUpdateProfileResponseDTO UserUpdateProfileResponseDTO}
     */
    public UserUpdateProfileResponseDTO updateDescription(
            String email,
            UserUpdateDescriptionRequestDTO userUpdateDescriptionRequestDTO
    ) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        user.setDescription(userUpdateDescriptionRequestDTO.description());
        userRepository.save(user);

        return new UserUpdateProfileResponseDTO(
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getDescription(),
                user.getAvatarURL()
        );
    }

    /**
     * Actualiza el nombre de usuario de un ususario
     *
     * @param email email del usuario
     * @param userUpdateUsernameRequestDTO dto con argumentos del request
     * @return {@link com.tripmates.backend.users.dto.UserUpdateProfileResponseDTO UserUpdateProfileResponseDTO}
     */
    public UserUpdateProfileResponseDTO updateUsername(
            String email,
            UserUpdateUsernameRequestDTO userUpdateUsernameRequestDTO
    ) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        user.setUsername(userUpdateUsernameRequestDTO.username());
        userRepository.save(user);

        return new UserUpdateProfileResponseDTO(
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getDescription(),
                user.getAvatarURL()
        );
    }
}
