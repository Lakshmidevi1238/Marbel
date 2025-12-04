package com.marblejar.repository;

import com.marblejar.entity.RefreshToken;
import com.marblejar.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    List<RefreshToken> findAllByUserAndExpiresAtAfterAndRevokedFalse(User user, Instant now);
    List<RefreshToken> findAllByExpiresAtAfterAndRevokedFalse(Instant now);
    void deleteAllByUser(User user);
    Optional<RefreshToken> findByTokenHash(String tokenHash);
}
