package com.marblejar.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);

    private final SecretKey signingKey;
    private final long expirationMs;
    private final long allowedClockSkewSeconds = 60; // allow 60s clock skew

    public JwtUtil(@Value("${jwt.secret:change-me-please-long-random-string}") String secret,
                   @Value("${jwt.expiration-ms:900000}") long expirationMs) {
        if (secret == null || secret.length() < 32) {
            // Keys.hmacShaKeyFor requires >= 256-bit key (32 bytes)
            log.warn("JWT secret is shorter than recommended (>=32 chars). Consider using a longer secret.");
        }
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generateToken(String subject) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + expirationMs))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(signingKey)
                    .setAllowedClockSkewSeconds(allowedClockSkewSeconds)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException ex) {
            log.info("JWT expired: {}", ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            log.warn("Unsupported JWT: {}", ex.getMessage());
        } catch (MalformedJwtException ex) {
            log.warn("Malformed JWT: {}", ex.getMessage());
        } catch (SecurityException | SignatureException ex) {
            log.warn("Invalid JWT signature: {}", ex.getMessage());
        } catch (JwtException ex) {
            log.warn("JWT validation error: {}", ex.getMessage());
        } catch (Exception ex) {
            log.error("Unexpected error validating JWT", ex);
        }
        return false;
    }

    public String getUsername(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .setAllowedClockSkewSeconds(allowedClockSkewSeconds)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }
}
