package com.tripmates.backend.config.security.jwt;

import java.security.Key;
import java.sql.Date;

import com.tripmates.backend.common.UserCredentials;

import java.nio.charset.StandardCharsets;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

public class JwtService {
    private final String secret = "your-secret-key-should-be-long-and-secure";
    private final Key key;

    public JwtService() {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(UserCredentials userCredentials) {
        return Jwts.builder()
                .setSubject(userCredentials.getEmail())
                .claim("role", userCredentials.getRole())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 5)) // 5 horas
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public UserCredentials extractUserCredentials(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return new UserCredentialsFromJwt(claims.getSubject(), claims.get("role", String.class));
    }
}
