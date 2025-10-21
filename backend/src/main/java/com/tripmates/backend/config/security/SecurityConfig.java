package com.tripmates.backend.config.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

import com.tripmates.backend.config.security.jwt.JwtAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // OJO: si querés exponer /users/* al público, agregá "/users/*".
    // Si NO, dejalo autenticado. CORS igual debe responder a OPTIONS.
    public static final String[] PUBLIC_ENDPOINTS = {
        "/auth/login",
        "/auth/refresh",
        "/auth/logout",
        "/auth/register",
        "/actuator/health",
        "/v3/api-docs/**",      // springdoc moderno
        "/swagger-ui/**",
        "/swagger-ui.html",
        "/swagger-resources/**",
        "/webjars/**"
    };

    private final JwtAuthenticationFilter authFilter;

    public SecurityConfig(JwtAuthenticationFilter authFilter) {
        this.authFilter = authFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            // HABILITAR CORS en la cadena de filtros de Spring Security
            .cors(Customizer.withDefaults())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Permitir SIEMPRE la preflight
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // Públicos reales
                .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                // Resto autenticado
                .anyRequest().authenticated()
            )
            .addFilterBefore(authFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        // dominio del front en dev
        cfg.setAllowedOrigins(List.of("http://localhost:5173"));
        // métodos que vas a usar
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        // headers que puede mandar el cliente (¡incluí Authorization!)
        cfg.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        // si usás cookies o credentials en fetch
        cfg.setAllowCredentials(true);
        // opcional: exponer headers al cliente
        // cfg.setExposedHeaders(List.of("Location"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }
}