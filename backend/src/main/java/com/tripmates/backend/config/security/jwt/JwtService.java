package com.tripmates.backend.config.security.jwt;

import java.security.Key;
import java.sql.Date;

import org.springframework.security.core.userdetails.UserDetails;

import java.nio.charset.StandardCharsets;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class JwtService {
    private final String secret = "your-secret-key-should-be-long-and-secure";
    private final Key key;

    public JwtService() {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(UserDetails userCredentials) {
        return Jwts.builder()
                .setSubject(userCredentials.getUsername())
                .claim("role", userCredentials.getAuthorities().toArray())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 5)) // 5 horas
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public UserDetails extractUserDetails(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return new UserDetailFromJwt(claims.getSubject(), claims.get("role", String.class));
    }
}
