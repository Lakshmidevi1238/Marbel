package com.marblejar.service;




import com.marblejar.entity.User;

public interface RefreshTokenService {

    /**
     * Create and persist a refresh token for the given user and return the raw token string to the caller.
     */
    String createRefreshToken(User user);

    /**
     * Verify a raw refresh token, rotate it (delete old + create new), and return the new raw refresh token
     * along with the username/email of the associated user (RotateResult).
     *
     * Throws UnauthorizedException (or a custom exception) if invalid/expired/revoked.
     */
    RotateResult verifyAndRotate(String rawRefreshToken);

    /**
     * Revoke the given refresh token (delete or mark revoked).
     */
    void revoke(String rawRefreshToken);

    /**
     * Remove all refresh tokens for a given user (e.g. logout all sessions).
     */
    void deleteAllForUser(User user);
}
