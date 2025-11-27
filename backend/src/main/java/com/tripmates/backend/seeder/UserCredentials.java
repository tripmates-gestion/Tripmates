package com.tripmates.backend.seeder;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.tripmates.backend.common.types.BusinessType;
import com.tripmates.backend.common.types.Role;

public class UserCredentials {
    private String name;
    private String email;
    private String password;
    private Role role;
    private BusinessType businessType;

    // Getters y setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public BusinessType getBusinessType() {
        return businessType;
    }

    public void setBusinessType(BusinessType businessType) {
        this.businessType = businessType;
    }
}

class UserCredentialsWrapper {
    private UserCredentials[] users;

    public UserCredentials[] getUsers() {
        return users;
    }

    public void setUsers(UserCredentials[] users) {
        this.users = users;
    }
}
