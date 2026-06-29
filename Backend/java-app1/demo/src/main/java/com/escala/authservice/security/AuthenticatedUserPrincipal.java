package com.escala.authservice.security;

import java.security.Principal;
import java.util.Set;
import java.util.UUID;

public record AuthenticatedUserPrincipal(
        UUID userId,
        String email,
        UUID companyId,
        String companySlug,
        Set<String> roles
) implements Principal {

    @Override
    public String getName() {
        if (email != null && !email.isBlank()) {
            return email;
        }
        return userId != null ? userId.toString() : "anonymous";
    }
}
