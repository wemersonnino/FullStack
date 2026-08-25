package com.escala.authservice.config;

import com.escala.authservice.security.AuthenticatedUserPrincipal;
import com.escala.authservice.security.TenantContext;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.hibernate.Session;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Enables the Hibernate tenant filter for every authenticated HTTP request.
 * The tenant comes only from the server-validated JWT principal; request
 * parameters and headers are deliberately ignored.
 */
@Component
public class TenantIsolationFilter extends OncePerRequestFilter {

    static final String HIBERNATE_FILTER_NAME = "tenantFilter";
    static final String TENANT_PARAMETER_NAME = "tenantId";

    @PersistenceContext
    private EntityManager entityManager;

    private final TenantContext tenantContext;

    public TenantIsolationFilter(TenantContext tenantContext) {
        this.tenantContext = tenantContext;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            filterChain.doFilter(request, response);
            return;
        }

        if (!(authentication.getPrincipal() instanceof AuthenticatedUserPrincipal principal)
                || principal.companyId() == null) {
            SecurityContextHolder.clearContext();
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Tenant ausente no principal autenticado");
            return;
        }

        // Global access is an explicit, role-backed exception. Application
        // services must still opt into global repository methods deliberately.
        if (tenantContext.hasGlobalTenantAccess()) {
            filterChain.doFilter(request, response);
            return;
        }

        Session session = entityManager.unwrap(Session.class);
        session.enableFilter(HIBERNATE_FILTER_NAME)
                .setParameter(TENANT_PARAMETER_NAME, principal.companyId());
        try {
            filterChain.doFilter(request, response);
        } finally {
            if (session.getEnabledFilter(HIBERNATE_FILTER_NAME) != null) {
                session.disableFilter(HIBERNATE_FILTER_NAME);
            }
        }
    }
}
