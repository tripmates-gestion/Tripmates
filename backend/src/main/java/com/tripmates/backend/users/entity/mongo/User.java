package com.tripmates.backend.users.entity.mongo;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import com.tripmates.backend.common.UserCredentials;
import com.tripmates.backend.users.entity.Role;

import jakarta.validation.constraints.NotNull;
import org.springframework.data.mongodb.core.index.Indexed;

@Document(collection = "users")
public class User implements UserCredentials {
    @Id
    private String id;

    @NotNull
    @Indexed(unique = true)
    private String email;

    @NotNull
    private String password;

    @NotNull
    @Field(targetType = FieldType.STRING)
    private Role role;

    @Override
    public String getEmail() {
        return email;
    }

    @Override
    public String getRole() {
        return role.name();
    }

}