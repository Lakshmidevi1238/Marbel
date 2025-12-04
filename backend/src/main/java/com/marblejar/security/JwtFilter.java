// com/marblejar/security/JwtFilter.java
package com.marblejar.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    public JwtFilter(JwtUtil jwtUtil, UserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        logger.debug("JwtFilter - Authorization header present? " + (header != null));

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7).trim();
            try {
                if (jwtUtil.validateToken(token)) {
                    String username = jwtUtil.getUsername(token);

                    // load UserDetails from your CustomUserDetailsService
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                    // build authentication using UserDetails as principal
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

                    // attach request details (optional but useful)
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // set in SecurityContext
                    org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(auth);

                    logger.debug("JwtFilter - authentication set for user: " + username
                            + ", authorities: " + userDetails.getAuthorities());
                } else {
                    logger.debug("JwtFilter - token validation returned false (invalid token)");
                }
            } catch (ExpiredJwtException e) {
                // token expired: let request continue as anonymous (security will reject protected endpoints)
                // optionally log or set a header to indicate token expired
                logger.debug("JWT expired: " + e.getMessage());
            } catch (Exception ex) {
                // invalid token -> treat as anonymous
                logger.debug("Invalid JWT token: " + ex.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}
