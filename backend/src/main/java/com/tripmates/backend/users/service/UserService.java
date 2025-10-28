package com.tripmates.backend.users.service;

import com.tripmates.backend.auth.exception.UserNotFoundException;
import com.tripmates.backend.users.dto.UserResumeResponseDTO;
import com.tripmates.backend.users.dto.UserUpdateRequestDTO;
import com.tripmates.backend.users.entity.mongo.User;
import com.tripmates.backend.users.repository.mongo.UserRepository;
import com.tripmates.backend.common.service.storage.StorageService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StorageService storageService;

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

    public UserResumeResponseDTO updateUser(
            String email,
            UserUpdateRequestDTO userUpdateRequestDTO
    ) {
        return updateUser(email, userUpdateRequestDTO, null, null);
    }

    public UserResumeResponseDTO updateUser(
            String email,
            UserUpdateRequestDTO userUpdateRequestDTO,
            List<MultipartFile> imageFiles
    ) {
        return updateUser(email, userUpdateRequestDTO, imageFiles, null);
    }

    public UserResumeResponseDTO updateUser(
            String email,
            UserUpdateRequestDTO userUpdateRequestDTO,
            List<MultipartFile> imageFiles,
            MultipartFile avatar
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
            String previous = user.getAvatarURL();
            String next = userUpdateRequestDTO.avatarURL();
            if (previous != null && !previous.isBlank() && (next == null || !previous.equals(next))) {
                storageService.deleteByUrl(previous);
            }
            user.setAvatarURL(next);
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

        if (imageFiles != null && !imageFiles.isEmpty()) {
            if (user.getProfileImageUrls() != null) {
                for (String oldUrl : user.getProfileImageUrls()) {
                    if (oldUrl != null && !oldUrl.isBlank()) {
                        storageService.deleteByUrl(oldUrl);
                    }
                }
            }
            List<String> urls = new ArrayList<>();
            for (MultipartFile file : imageFiles) {
                String url = storageService.uploadFile(file);
                urls.add(url);
            }
            user.setProfileImageUrls(urls);
            if (user.getAvatarURL() == null && !urls.isEmpty()) {
                user.setAvatarURL(urls.get(0));
            }
        } else if (userUpdateRequestDTO.profileImageUrls() != null) {
            if (user.getProfileImageUrls() != null) {
                for (String oldUrl : user.getProfileImageUrls()) {
                    if (oldUrl != null && !oldUrl.isBlank()) {
                        storageService.deleteByUrl(oldUrl);
                    }
                }
            }
            user.setProfileImageUrls(userUpdateRequestDTO.profileImageUrls());
        }

        if (avatar != null && !avatar.isEmpty()) {
            String previous = user.getAvatarURL();
            if (previous != null && !previous.isBlank()) {
                storageService.deleteByUrl(previous);
            }
            String avatarUrl = storageService.uploadFile(avatar);
            user.setAvatarURL(avatarUrl);
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