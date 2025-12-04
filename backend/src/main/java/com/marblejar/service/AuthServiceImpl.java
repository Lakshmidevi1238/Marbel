package com.marblejar.service;

import com.marblejar.dto.LoginDto;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import com.marblejar.dto.RegisterDto;
import com.marblejar.dto.TokenResponse;

import com.marblejar.entity.User;
import com.marblejar.exception.UnauthorizedException;
import com.marblejar.repository.UserRepository;
import com.marblejar.security.JwtUtil;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    private static final int BCRYPT_MAX_BYTES = 72;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;

    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtUtil jwtUtil,
                           RefreshTokenService refreshTokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.refreshTokenService = refreshTokenService;
    }

    // Helper: enforce bcrypt byte-length limit using UTF-8 bytes
    private void ensurePasswordBytesWithinLimit(String pw) {
        if (pw == null) throw new IllegalArgumentException("Password required");
        int bytes = pw.getBytes(StandardCharsets.UTF_8).length;
        if (bytes > BCRYPT_MAX_BYTES) {
            throw new IllegalArgumentException("Password cannot be more than " + BCRYPT_MAX_BYTES + " bytes");
        }
    }

    @Override
    @Transactional
    public void register(RegisterDto dto) {
        if (dto == null) throw new IllegalArgumentException("Missing registration payload");
        // Basic character-length check (keeps DTO @Size for min), but enforce byte-length here
        if (dto.getPassword() == null || dto.getPassword().length() < 8) {
            throw new IllegalArgumentException("Password too short");
        }
        // enforce bcrypt byte limit
        ensurePasswordBytesWithinLimit(dto.getPassword());

        // ensure unique email
        userRepository.findByEmail(dto.getEmail()).ifPresent(u -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT,"Email already registered");
        });

        User u = new User();
        u.setEmail(dto.getEmail().toLowerCase().trim());
        u.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        u.setName(dto.getName());
        u.setCreatedAt(Instant.now());
        userRepository.save(u);
    }

    @Override
    public TokenResponse login(LoginDto dto) {
        if (dto == null) throw new UnauthorizedException("Invalid credentials");

        User u = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        String password = dto.getPassword();
        if (password == null) {
            throw new UnauthorizedException("Invalid credentials");
        }

        // enforce bcrypt byte-length limit to avoid encoder exceptions
        try {
            ensurePasswordBytesWithinLimit(password);
        } catch (IllegalArgumentException ex) {
            // map validation error to generic auth failure for security
            throw new UnauthorizedException("Invalid credentials");
        }

        // compare safely (catch encoder exceptions and map to Unauthorized)
        boolean matches;
        try {
            matches = passwordEncoder.matches(password, u.getPasswordHash());
        } catch (IllegalArgumentException ex) {
            // encoder threw (e.g. bad hash format or bad input) -> treat as invalid credentials
            throw new UnauthorizedException("Invalid credentials");
        }

        if (!matches) {
            throw new UnauthorizedException("Invalid credentials");
        }

        // success: generate tokens
        String accessToken = jwtUtil.generateToken(u.getEmail());
        String rawRefresh = refreshTokenService.createRefreshToken(u); // service returns raw token string
        
        return new TokenResponse(accessToken, rawRefresh);
    }

    @Override
    public TokenResponse refresh(String rawRefreshToken) {
        RotateResult rotate = refreshTokenService.verifyAndRotate(rawRefreshToken);
        String newAccess = jwtUtil.generateToken(rotate.getUsername());

        return new TokenResponse(newAccess, rotate.getNewRefreshToken());
    }

    @Override
    public void logout(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        refreshTokenService.deleteAllForUser(user);
    }

    @Override
    public void revokeRefreshToken(String rawRefreshToken) {
        if (rawRefreshToken != null && !rawRefreshToken.isBlank()) {
            refreshTokenService.revoke(rawRefreshToken);
        }
    }
}
