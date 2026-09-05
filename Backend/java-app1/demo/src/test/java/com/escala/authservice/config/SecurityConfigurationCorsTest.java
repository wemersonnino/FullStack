package com.escala.authservice.config;

import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.cors.CorsConfiguration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;

class SecurityConfigurationCorsTest {

    @Test
    void rejectsAnUnconfiguredOriginAndDoesNotAllowCookies() {
        SecurityConfiguration configuration = new SecurityConfiguration(
                mock(JwtAuthenticationFilter.class),
                mock(TenantIsolationFilter.class),
                mock(AuthenticationProvider.class)
        );
        ReflectionTestUtils.setField(configuration, "allowedOrigins", "https://app.escala.example");

        CorsConfiguration cors = configuration.corsConfigurationSource()
                .getCorsConfiguration(new org.springframework.mock.web.MockHttpServletRequest());

        assertEquals("https://app.escala.example", cors.checkOrigin("https://app.escala.example"));
        assertNull(cors.checkOrigin("https://evil.example"));
        assertEquals(Boolean.FALSE, cors.getAllowCredentials());
        assertTrue(cors.getAllowedHeaders().contains("Authorization"));
    }
}
