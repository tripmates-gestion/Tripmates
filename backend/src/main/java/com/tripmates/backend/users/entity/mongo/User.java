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
    /**
     * Identificador único del usuario.
     */
    @Id
    private String id;

    /**
     * Email del usuario.
     */
    @NotNull
    @Indexed(unique = true)
    private String email;

    /**
     * Contraseña del usuario.
     */
    @NotNull
    private String password;

    /**
     * Rol del usuario.
     * Los tipos de roles pueden verse en {@link com.tripmates.backend.users.entity.Role Role}.
     */
    @NotNull
    @Field(targetType = FieldType.STRING)
    private Role role;

    /**
     * Refresh token del usuario para mantener activa su sesión.
     */
    @Indexed(unique = true)
    private String token;

    /**
     * Devuelve la contraseña del usuario.
     *
     * @return contraseña del usuario.
     */
    @Override
    public String getPassword() {
        return this.password;
    }

    /**
     * Devuelve el nombre de usuario del usuario.
     *
     * @return email del usuario.
     */
    @Override
    public String getUsername() {
        return this.email;
    }

    /**
     * Devuelve las autoridades del usuario para Spring Security.
     *
     * @return las autoridades del usuario.
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + this.role.name()));
    }

}