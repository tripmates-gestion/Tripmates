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
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import org.springframework.data.mongodb.core.index.Indexed;

/**
 * Representa un usuario del sistema, y define el documento
 * que sera persistido en MongoDB.
 *
 * @see com.tripmates.backend.users.entity.Role
 * @see org.springframework.security.core.userdetails.UserDetails
 */
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
    @Size(min = 10, max = 50, message = "User's username must be between 3 and 50 characters")
    private String username;

    @NotNull
    private String password;

    @Size(max = 500, message = "User's description cannot exceed 500 characters")
    private String description;

    @NotNull
    @Field(targetType = FieldType.STRING)
    private Role role;

    @Size(max = 500, message = "User's avatar URL cannot exceed 500 characters")
    private String avatarURL;

    private String token;

    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public String getUsername() {
        return this.username;
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
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
