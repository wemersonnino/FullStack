package com.escala.authservice.config;

import com.escala.authservice.security.AuthenticatedUserPrincipal;
import com.escala.authservice.service.AuthoritativeIdentityService;
import com.escala.authservice.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import lombok.RequiredArgsConstructor;
import io.jsonwebtoken.JwtException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final List<String> PUBLIC_PATH_PREFIXES = List.of(
            "/api/v1/auth",
            "/api/v1/public",
            "/api/v1/billing/webhook",
            "/actuator/health",
            "/error",
            "/swagger-ui",
            "/v3/api-docs",
            "/webjars"
    );

    private final JwtService jwtService;
    private final AuthoritativeIdentityService authoritativeIdentityService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return PUBLIC_PATH_PREFIXES.stream().anyMatch(path::startsWith);
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String principalIdentifier;
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        try {
            jwt = authHeader.substring(7);
            principalIdentifier = jwtService.extractUsername(jwt);
            if (principalIdentifier != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UUID userId = jwtService.extractUuidClaim(jwt, "id");
                if (userId != null
                        && principalIdentifier.equals(userId.toString())
                        && jwtService.isTokenValidForSubject(jwt, userId)) {
                    AuthenticatedUserPrincipal principal = authoritativeIdentityService
                            .resolveActiveIdentity(userId)
                            .orElse(null);
                    if (principal == null) {
                        SecurityContextHolder.clearContext();
                        filterChain.doFilter(request, response);
                        return;
                    }
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            principal,
                            null,
                            principal.roles().stream().map(SimpleGrantedAuthority::new).toList()
                    );
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (JwtException | IllegalArgumentException exception) {
            SecurityContextHolder.clearContext();
        }
        filterChain.doFilter(request, response);
    }
}
