package com.tripmates.backend.users.service;

import com.tripmates.backend.users.dto.UserProfileResponseDTO;
import com.tripmates.backend.users.dto.DescriptionUpdateRequestDTO;
import com.tripmates.backend.users.dto.UsernameUpdateRequestDTO;
import com.tripmates.backend.users.entity.mongo.User;
import com.tripmates.backend.users.repository.mongo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.NoSuchElementException;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

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

    public UserProfileResponseDTO updateDescription(String emailOrUsername, DescriptionUpdateRequestDTO dto) {
        User user = userRepository.findByEmail(emailOrUsername)
                .orElseThrow(() -> new NoSuchElementException("User not found"));
        user.setDescription(dto.description());
        userRepository.save(user);
        return new UserProfileResponseDTO(user);
    }

    public UserProfileResponseDTO updateUsername(String emailOrUsername, UsernameUpdateRequestDTO dto) {
        User user = userRepository.findByEmail(emailOrUsername)
                .orElseThrow(() -> new NoSuchElementException("User not found"));
        user.setUsername(dto.username());
        userRepository.save(user);
        return new UserProfileResponseDTO(user);
    }
}
