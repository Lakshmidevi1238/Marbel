package com.marblejar.service;

import com.marblejar.entity.RefreshToken;
import com.marblejar.entity.User;
import com.marblejar.exception.UnauthorizedException;
import com.marblejar.repository.RefreshTokenRepository;
import com.marblejar.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    // configurable validity (ms) with sensible default (1 day)
    private final long refreshTokenValidityMs;

    public RefreshTokenServiceImpl(RefreshTokenRepository refreshTokenRepository,
                                   UserRepository userRepository,
                                   @Value("${app.refreshTokenValidityMs:86400000}") long refreshTokenValidityMs) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
        this.refreshTokenValidityMs = refreshTokenValidityMs;
    }

    @Override
    @Transactional
    public String createRefreshToken(User user) {
        String raw = UUID.randomUUID().toString();               // raw token returned to client
        String hash = sha256Hex(raw);                           // stored hash

        RefreshToken rt = new RefreshToken();
        rt.setUser(user);
        rt.setTokenHash(hash);
        rt.setExpiresAt(Instant.now().plusMillis(refreshTokenValidityMs));
        rt.setRevoked(false);

        refreshTokenRepository.save(rt);
        return raw;
    }

    @Override
    @Transactional
    public RotateResult verifyAndRotate(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        String hash = sha256Hex(rawRefreshToken);
        Optional<RefreshToken> found = refreshTokenRepository.findByTokenHash(hash);
        RefreshToken rt = found.orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (rt.isRevoked()) {
            throw new UnauthorizedException("Refresh token revoked");
        }
        if (rt.getExpiresAt() == null || rt.getExpiresAt().isBefore(Instant.now())) {
            throw new UnauthorizedException("Refresh token expired");
        }

        // rotation: replace hash+expires on the same DB row (keeps single entry)
        String newRaw = UUID.randomUUID().toString();
        rt.setTokenHash(sha256Hex(newRaw));
        rt.setExpiresAt(Instant.now().plusMillis(refreshTokenValidityMs));
        // keep revoked=false
        refreshTokenRepository.save(rt);

        // return rotated raw token and the username/email for access token creation
        String username = rt.getUser().getEmail();
        return new RotateResult(newRaw, username);
    }

    @Override
    @Transactional
    public void revoke(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) return;
        String hash = sha256Hex(rawRefreshToken);
        refreshTokenRepository.findByTokenHash(hash).ifPresent(rt -> {
            rt.setRevoked(true);
            refreshTokenRepository.save(rt);
        });
    }

    @Override
    @Transactional
    public void deleteAllForUser(User user) {
        // repository method will delete all refresh tokens for the user
        refreshTokenRepository.deleteAllByUser(user);
    }

    // --- helper: SHA-256 hex ---
    private static String sha256Hex(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
            // Java 17+ convenience; if on older JDK, use a manual hex builder
            return HexFormat.of().formatHex(digest);
        } catch (Exception e) {
            throw new RuntimeException("Failed to hash refresh token", e);
        }
    }
}
