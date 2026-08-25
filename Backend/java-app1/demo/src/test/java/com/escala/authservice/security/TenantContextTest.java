package com.escala.authservice.security;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TenantContextTest {

    private final TenantContext tenantContext = new TenantContext();

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void resolvesTenantOnlyFromAuthenticatedPrincipal() {
        UUID tenantId = UUID.randomUUID();
        authenticate(new AuthenticatedUserPrincipal(
                UUID.randomUUID(), "owner@tenant-a.test", tenantId, "tenant-a", Set.of("OWNER")
        ));

        assertEquals(tenantId, tenantContext.requireTenantId());
        assertFalse(tenantContext.hasGlobalTenantAccess());
    }

    @Test
    void identifiesExplicitSystemAdminException() {
        authenticate(new AuthenticatedUserPrincipal(
                UUID.randomUUID(), "system@example.test", UUID.randomUUID(), "system", Set.of("SYSTEM_ADMIN")
        ));

        assertTrue(tenantContext.hasGlobalTenantAccess());
    }

    @Test
    void rejectsMissingTenantOrUntrustedPrincipal() {
        assertThrows(AccessDeniedException.class, tenantContext::requireTenantId);

        authenticate(new AuthenticatedUserPrincipal(
                UUID.randomUUID(), "owner@example.test", null, null, Set.of("OWNER")
        ));
        assertThrows(AccessDeniedException.class, tenantContext::requireTenantId);
    }

    private void authenticate(AuthenticatedUserPrincipal principal) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, Set.of())
        );
    }
}
