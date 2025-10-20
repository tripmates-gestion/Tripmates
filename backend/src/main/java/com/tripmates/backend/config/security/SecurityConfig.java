package com.tripmates.backend.config.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.tripmates.backend.config.security.jwt.JwtAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        public static final String[] PUBLIC_ENDPOINTS = {
                "/users",
                "/auth/login", "/auth/refresh", "/auth/logout",
                "/actuator/health",
                "/api-docs/**", // Ruta que configuraste en application.properties
                "/swagger-ui/**", // UI de Swagger
                "/swagger-ui.html", // HTML de Swagger UI
                "/swagger-resources/**", // Recursos de Swagger
                "/webjars/**"
        };

        @Autowired
        private JwtAuthenticationFilter authFilter;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(AbstractHttpConfigurer::disable)
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                                                .anyRequest().authenticated())
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .addFilterBefore(authFilter, UsernamePasswordAuthenticationFilter.class);
                return http.build();
        }

}
