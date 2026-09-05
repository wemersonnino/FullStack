package com.escala.authservice.config;

import com.escala.authservice.security.AuthenticatedUserPrincipal;
import com.escala.authservice.service.AuthoritativeIdentityService;
import com.escala.authservice.service.JwtService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class JwtAuthenticationFilterTest {

    private final JwtService jwtService = mock(JwtService.class);
    private final AuthoritativeIdentityService identityService = mock(AuthoritativeIdentityService.class);
    private final JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwtService, identityService);

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void replacesStaleJwtRolesAndTenantWithTheAuthoritativeIdentity() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID currentCompanyId = UUID.randomUUID();
        AuthenticatedUserPrincipal currentIdentity = new AuthenticatedUserPrincipal(
                userId, "user@example.com", currentCompanyId, "tenant-current", Set.of("USER")
        );
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer signed-token");

        when(jwtService.extractUsername("signed-token")).thenReturn(userId.toString());
        when(jwtService.extractUuidClaim("signed-token", "id")).thenReturn(userId);
        when(jwtService.isTokenValidForSubject("signed-token", userId)).thenReturn(true);
        when(identityService.resolveActiveIdentity(userId)).thenReturn(Optional.of(currentIdentity));

        filter.doFilter(request, new MockHttpServletResponse(), (req, res) -> {
            var authentication = SecurityContextHolder.getContext().getAuthentication();
            var principal = (AuthenticatedUserPrincipal) authentication.getPrincipal();
            assertEquals(currentCompanyId, principal.companyId());
            assertEquals(Set.of("USER"), principal.roles());
            assertTrue(authentication.getAuthorities().stream().anyMatch(role -> role.getAuthority().equals("USER")));
            assertFalse(authentication.getAuthorities().stream().anyMatch(role -> role.getAuthority().equals("ADMIN")));
        });
    }

    @Test
    void rejectsAValidlySignedTokenForAUserThatIsNoLongerActive() throws Exception {
        UUID userId = UUID.randomUUID();
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer signed-token");

        when(jwtService.extractUsername("signed-token")).thenReturn(userId.toString());
        when(jwtService.extractUuidClaim("signed-token", "id")).thenReturn(userId);
        when(jwtService.isTokenValidForSubject("signed-token", userId)).thenReturn(true);
        when(identityService.resolveActiveIdentity(userId)).thenReturn(Optional.empty());

        filter.doFilter(request, new MockHttpServletResponse(), (req, res) ->
                assertFalse(SecurityContextHolder.getContext().getAuthentication() != null));

        verify(identityService).resolveActiveIdentity(userId);
    }
}
