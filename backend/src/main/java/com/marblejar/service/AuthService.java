package com.marblejar.service;

import com.marblejar.dto.LoginDto;
import com.marblejar.dto.RegisterDto;
import com.marblejar.dto.TokenResponse;

public interface AuthService {
    void register(RegisterDto dto);
    TokenResponse login(LoginDto dto);
    TokenResponse refresh(String rawRefreshToken); // or TokenResponse rotate result
    void logout(Long userId);
    void revokeRefreshToken(String rawRefreshToken);
}
