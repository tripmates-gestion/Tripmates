package com.tripmates.backend.users.service;

import com.tripmates.backend.auth.exception.UserNotFoundException;
import com.tripmates.backend.users.dto.UserResumeResponseDTO;
import com.tripmates.backend.users.dto.UserUpdateRequestDTO;
import com.tripmates.backend.users.entity.mongo.User;
import com.tripmates.backend.users.repository.mongo.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        return UserResumeResponseDTO.fromUser(user);
    }

    public UserResumeResponseDTO updateUser(
            String email,
            UserUpdateRequestDTO userUpdateRequestDTO
    ) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (userUpdateRequestDTO.name() != null) {
            user.setName(userUpdateRequestDTO.name());
        }
        if (userUpdateRequestDTO.description() != null) {
            user.setDescription(userUpdateRequestDTO.description());
        }
        if (userUpdateRequestDTO.avatarURL() != null) {
            user.setAvatarURL(userUpdateRequestDTO.avatarURL());
        }

        if (userUpdateRequestDTO.openingDays() != null) {
            user.setOpeningDays(userUpdateRequestDTO.openingDays());
        }
        if (userUpdateRequestDTO.attentionSchedule() != null) {
            user.setAttentionSchedule(userUpdateRequestDTO.attentionSchedule());
        }
        if (userUpdateRequestDTO.exceptionalClosingDays() != null) {
            user.setExceptionalClosingDays(userUpdateRequestDTO.exceptionalClosingDays());
        }
        if (userUpdateRequestDTO.phoneNumber() != null) {
            user.setPhoneNumber(userUpdateRequestDTO.phoneNumber());
        }
        if (userUpdateRequestDTO.location() != null) {
            user.setLocation(userUpdateRequestDTO.location());
        }
        if (userUpdateRequestDTO.profileImageUrls() != null) {
            user.setProfileImageUrls(userUpdateRequestDTO.profileImageUrls());
        }

        userRepository.save(user);
        
        return new UserResumeResponseDTO(
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getDescription(),
                user.getAvatarURL(),
                user.getBusinessType(),
                user.getOpeningDays(),
                user.getAttentionSchedule(),
                user.getExceptionalClosingDays(),
                user.getPhoneNumber(),
                user.getLocation(),
                user.getProfileImageUrls()
        );
    }
}