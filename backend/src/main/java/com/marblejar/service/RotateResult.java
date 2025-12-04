package com.marblejar.service;

/**
 * Simple return object for verifyAndRotate
 */
public class RotateResult {
    private final String newRefreshToken; // raw token to return to client
    private final String username;        // email/subject

    public RotateResult(String newRefreshToken, String username) {
        this.newRefreshToken = newRefreshToken;
        this.username = username;
    }

    public String getNewRefreshToken() {
        return newRefreshToken;
    }

    public String getUsername() {
        return username;
    }
}
