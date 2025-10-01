package com.tripmates.backend.config.security.jwt;

import com.tripmates.backend.common.UserCredentials;

public record UserCredentialsFromJwt(String email, String role) implements UserCredentials {
    @Override
    public String getEmail() {
        return email;
    }

    @Override
    public String getRole() {
        return role;
    }
}
