package com.tripmates.backend.users.entity.mongo;

import java.util.Collection;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import com.tripmates.backend.users.entity.Role;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import org.springframework.data.mongodb.core.index.Indexed;
import com.tripmates.backend.common.types.AttentionSchedule;

import java.time.DayOfWeek;
import java.time.LocalDate;

@Getter
@Setter
@Document(collection = "users")
public class User implements UserDetails {

    @Id
    private String id;

    @NotNull
    @Indexed(unique = true)
    private String email;

    @NotNull
    private String name;

    @NotNull
    private String password;

    private String description;

    private String businessType;

    @NotNull
    @Field(targetType = FieldType.STRING)
    private Role role;

    private String avatarURL;

    private String token;

    private List<DayOfWeek> openingDays;
    private AttentionSchedule attentionSchedule;
    private List<LocalDate> exceptionalClosingDays;
    private String phoneNumber;
    private String location;
    private List<String> profileImageUrls;

    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public String getUsername() {
        return this.email; 
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + this.role.name()));
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() { 
        return true; 
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}