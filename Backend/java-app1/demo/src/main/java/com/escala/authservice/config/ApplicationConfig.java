package com.escala.authservice.config;

import com.escala.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Locale;
import java.util.UUID;

@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {

    private final UserRepository repository;

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> resolveUser(username)
                .map(user -> org.springframework.security.core.userdetails.User.builder()
                        .username(resolvePrincipal(username, user.getEmail(), user.getId()))
                        .password(user.getPassword())
                        .authorities(user.getRoles().stream()
                                .map(role -> role.getName())
                                .toArray(String[]::new))
                        .build())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    private java.util.Optional<com.escala.authservice.entity.User> resolveUser(String username) {
        try {
            return repository.findById(UUID.fromString(username));
        } catch (IllegalArgumentException ignored) {
            return repository.findByEmail(username == null ? null : username.trim().toLowerCase(Locale.ROOT));
        }
    }

    private String resolvePrincipal(String requestedUsername, String email, UUID userId) {
        try {
            UUID.fromString(requestedUsername);
            return userId.toString();
        } catch (IllegalArgumentException ignored) {
            return email;
        }
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
