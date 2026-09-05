package com.escala.authservice.service;

import com.escala.authservice.entity.Role;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.UserRepository;
import com.escala.authservice.security.AuthenticatedUserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Resolves the current authorization state for a JWT subject. JWT claims are
 * intentionally not authoritative for tenant, roles, or account activity.
 */
@Service
@RequiredArgsConstructor
public class AuthoritativeIdentityService {

    private final UserRepository userRepository;

    public Optional<AuthenticatedUserPrincipal> resolveActiveIdentity(UUID userId) {
        return userRepository.findById(userId)
                .filter(this::isEligibleForAuthentication)
                .map(this::toPrincipal);
    }

    private boolean isEligibleForAuthentication(User user) {
        return user.isActive()
                && user.getCompany() != null
                && user.getCompany().isActive();
    }

    private AuthenticatedUserPrincipal toPrincipal(User user) {
        Set<String> roles = user.getRoles() == null
                ? Set.of()
                : user.getRoles().stream().map(Role::getName).collect(Collectors.toUnmodifiableSet());

        return new AuthenticatedUserPrincipal(
                user.getId(),
                user.getEmail(),
                user.getCompany().getId(),
                user.getCompany().getSlug(),
                roles
        );
    }
}
