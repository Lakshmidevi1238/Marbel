package com.marblejar.controller;

import com.marblejar.dto.LoginDto;
import com.marblejar.dto.RegisterDto;
import com.marblejar.dto.RefreshRequest;
import com.marblejar.dto.TokenResponse;
import com.marblejar.exception.ApiException;
import com.marblejar.service.AuthService;
import com.marblejar.service.RefreshTokenService;
import com.marblejar.security.JwtUtil;
import com.marblejar.entity.User;
import com.marblejar.repository.UserRepository;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService; // still used for revoke in logout if you prefer

    public AuthController(AuthService authService,
                          RefreshTokenService refreshTokenService) {
        this.authService = authService;
        this.refreshTokenService = refreshTokenService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterDto dto) {
        authService.register(dto);
        return ResponseEntity.ok(Map.of("message", "registered"));
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginDto dto) {
        TokenResponse resp = authService.login(dto); // delegate to service
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(@RequestBody RefreshRequest req) {
        TokenResponse resp = authService.refresh(req.getRefreshToken());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody RefreshRequest request) {
        if (request.getRefreshToken() != null) {
            authService.revokeRefreshToken(request.getRefreshToken());
        }
        return ResponseEntity.ok(Map.of("ok", true));
    }

}
