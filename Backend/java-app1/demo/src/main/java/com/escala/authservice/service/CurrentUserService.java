package com.escala.authservice.service;

import com.escala.authservice.entity.User;
import com.escala.authservice.repository.UserRepository;
import com.escala.authservice.security.AuthenticatedUserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CurrentUserService {
    private final UserRepository userRepository;

    public User requireCurrentUser() {
        return requireCurrentUser(null);
    }

    public User requireCurrentUser(String fallbackPrincipal) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof AuthenticatedUserPrincipal principal) {
            if (principal.userId() != null) {
                return userRepository.findById(principal.userId())
                        .filter(user -> principal.companyId() == null
                                || (user.getCompany() != null && principal.companyId().equals(user.getCompany().getId())))
                        .orElseThrow(() -> new IllegalArgumentException("Usuario autenticado nao encontrado"));
            }

            if (principal.email() != null && principal.companySlug() != null) {
                return userRepository.findByEmailAndCompanySlug(normalize(principal.email()), principal.companySlug())
                        .orElseThrow(() -> new IllegalArgumentException("Usuario autenticado nao encontrado"));
            }
        }

        String resolved = fallbackPrincipal;
        if (resolved == null || resolved.isBlank()) {
            resolved = authentication != null ? authentication.getName() : null;
        }
        if (resolved == null || resolved.isBlank()) {
            throw new IllegalArgumentException("Usuario autenticado nao encontrado");
        }

        try {
            return userRepository.findById(UUID.fromString(resolved))
                    .orElseThrow(() -> new IllegalArgumentException("Usuario autenticado nao encontrado"));
        } catch (IllegalArgumentException ignored) {
            return userRepository.findByEmail(normalize(resolved))
                    .orElseThrow(() -> new IllegalArgumentException("Usuario autenticado nao encontrado"));
        }
    }

    private String normalize(String value) {
        return value == null ? null : value.trim().toLowerCase(Locale.ROOT);
    }
}
