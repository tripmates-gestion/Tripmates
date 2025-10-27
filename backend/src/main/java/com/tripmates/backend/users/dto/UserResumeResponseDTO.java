package com.tripmates.backend.users.dto;

import com.tripmates.backend.users.entity.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import com.tripmates.backend.common.types.AttentionSchedule;
import java.time.DayOfWeek;
import java.time.LocalDate;
import com.tripmates.backend.users.entity.mongo.User;

@Schema(description = "User profile response DTO")
public record UserResumeResponseDTO(
        @Schema(description = "User's username")
        String name,

        @Schema(description = "User's email")
        String email,

        @Schema(description = "User's role")
        Role role,

        @Schema(description = "User's description or bio")
        String description,

        @Schema(description = "User's avatar URL")
        String avatarURL,

        @Schema(description = "User's business type")
        String businessType,

        @Schema(description = "User's opening days")
        List<DayOfWeek> openingDays,

        @Schema(description = "User's attention schedule")
        AttentionSchedule attentionSchedule,

        @Schema(description = "User's exceptional closing days")
        List<LocalDate> exceptionalClosingDays,

        @Schema(description = "User's phone number")
        String phoneNumber,

        @Schema(description = "User's location")
        String location,

        @Schema(description = "User's profile image URLs")
        List<String> profileImageUrls
) { 
        public static UserResumeResponseDTO fromUser(User user) {
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