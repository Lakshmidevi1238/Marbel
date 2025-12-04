package com.marblejar.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class CorsConfig {

    // put your frontend URL here (e.g. http://localhost:3000)
    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(List.of(frontendUrl)); // use exact origin(s)
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        cfg.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "X-Requested-With"));
        cfg.setExposedHeaders(List.of("Authorization")); // if you send any custom headers back
        cfg.setAllowCredentials(true); // set to true only if you're using cookies/credentials
        cfg.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }

    // Optional: register CorsFilter explicitly (Spring will pick up the CorsConfigurationSource automatically
    // because you enabled .cors(...) in SecurityConfig, but adding the filter is also fine):
    @Bean
    public CorsFilter corsFilter() {
        return new CorsFilter((UrlBasedCorsConfigurationSource) corsConfigurationSource());
    }
}
