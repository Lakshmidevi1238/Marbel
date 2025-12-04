package com.marblejar.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.core.Ordered;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10) // run just after CorsFilter
public class RequestDebugFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RequestDebugFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        String origin = request.getHeader("Origin");
        String method = request.getMethod();

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean hasAuth = auth != null && auth.isAuthenticated();
        String principal = (auth != null) ? String.valueOf(auth.getPrincipal()) : "null";

        log.info("DEBUG-REQ: {} {} Origin={} AuthPresent={} principal={}", method, path, origin, hasAuth, principal);

        try {
            filterChain.doFilter(request, response);
        } catch (Exception ex) {
            log.error("DEBUG-REQ: exception while processing {} {} -> {}", method, path, ex.getClass().getSimpleName());
            throw ex;
        }
    }
}
