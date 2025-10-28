package com.tripmates.backend.users.service;

import com.tripmates.backend.auth.exception.UserNotFoundException;
import com.tripmates.backend.users.dto.UserResumeResponseDTO;
import com.tripmates.backend.users.dto.UserSearchRequestDTO;
import com.tripmates.backend.users.dto.UserUpdateRequestDTO;
import com.tripmates.backend.users.entity.mongo.User;
import com.tripmates.backend.users.repository.mongo.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    public UserResumeResponseDTO getUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        return UserResumeResponseDTO.fromUser(user);
    }

    /**
     *
     * @param email
     * @param userUpdateRequestDTO
     * @return
     */
    public UserResumeResponseDTO updateUser(String email, UserUpdateRequestDTO userUpdateRequestDTO) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (userUpdateRequestDTO.name() != null)
            user.setName(userUpdateRequestDTO.name());

        if (userUpdateRequestDTO.description() != null)
            user.setDescription(userUpdateRequestDTO.description());

        if (userUpdateRequestDTO.avatarURL() != null)
            user.setAvatarURL(userUpdateRequestDTO.avatarURL());

        if (userUpdateRequestDTO.openingDays() != null)
            user.setOpeningDays(userUpdateRequestDTO.openingDays());

        if (userUpdateRequestDTO.attentionSchedule() != null)
            user.setAttentionSchedule(userUpdateRequestDTO.attentionSchedule());

        if (userUpdateRequestDTO.exceptionalClosingDays() != null)
            user.setExceptionalClosingDays(userUpdateRequestDTO.exceptionalClosingDays());

        if (userUpdateRequestDTO.phoneNumber() != null)
            user.setPhoneNumber(userUpdateRequestDTO.phoneNumber());

        if (userUpdateRequestDTO.location() != null)
            user.setLocation(userUpdateRequestDTO.location());

        if (userUpdateRequestDTO.profileImageUrls() != null)
            user.setProfileImageUrls(userUpdateRequestDTO.profileImageUrls());

        return UserResumeResponseDTO.fromUser(userRepository.save(user));
    }

    /**
     *
     * @param userSearchRequestDTO
     * @param pageable
     * @return
     */
    public Page<UserResumeResponseDTO> search(UserSearchRequestDTO userSearchRequestDTO, Pageable pageable) {
        return userRepository.searchUsers(
                userSearchRequestDTO.role(),
                userSearchRequestDTO.location(),
                userSearchRequestDTO.businessType(),
                pageable
        ).map(UserResumeResponseDTO::fromUser);
    }
}