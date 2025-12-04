package com.marblejar.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class DebugController {
    @GetMapping("/debug/auth")
    public ResponseEntity<?> debugAuth() {
        Authentication a = SecurityContextHolder.getContext().getAuthentication();
        if (a == null) return ResponseEntity.ok(Map.of("auth", null));
        return ResponseEntity.ok(Map.of(
            "principal", a.getPrincipal(),
            "authenticated", a.isAuthenticated(),
            "authorities", a.getAuthorities()
        ));
    }
}
