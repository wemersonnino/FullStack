package com.escala.authservice.security;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Trusted tenant boundary for application code.
 *
 * <p>The tenant is read exclusively from the authenticated principal created
 * after JWT validation. Request headers, query parameters and request bodies
 * are intentionally not considered.</p>
 */
@Component
public class TenantContext {

    public UUID requireTenantId() {
        AuthenticatedUserPrincipal principal = requirePrincipal();
        if (principal.companyId() == null) {
            throw new AccessDeniedException("Tenant ausente na identidade autenticada");
        }
        return principal.companyId();
    }

    public boolean hasGlobalTenantAccess() {
        var roles = requirePrincipal().roles();
        return roles != null && roles.contains("SYSTEM_ADMIN");
    }

    private AuthenticatedUserPrincipal requirePrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof AuthenticatedUserPrincipal principal)) {
            throw new AccessDeniedException("Identidade autenticada obrigatoria para resolver o tenant");
        }
        return principal;
    }
}
