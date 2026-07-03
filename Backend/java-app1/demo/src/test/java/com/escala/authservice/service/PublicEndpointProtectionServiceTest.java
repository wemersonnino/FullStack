package com.escala.authservice.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.dao.InvalidDataAccessResourceUsageException;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.mock.web.MockHttpServletRequest;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PublicEndpointProtectionServiceTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private RecaptchaService recaptchaService;

    private PublicEndpointProtectionService service;

    @BeforeEach
    void setUp() {
        service = new PublicEndpointProtectionService(redisTemplate, recaptchaService);
        ReflectionTestUtils.setField(service, "requireBff", true);
        ReflectionTestUtils.setField(service, "bffSharedSecret", "shared-secret");
        ReflectionTestUtils.setField(service, "contactLimit", 2);
        ReflectionTestUtils.setField(service, "contactWindow", Duration.ofMinutes(15));
        ReflectionTestUtils.setField(service, "leadLimit", 2);
        ReflectionTestUtils.setField(service, "leadWindow", Duration.ofMinutes(15));
    }

    @Test
    void rejectsRequestsWithoutTrustedBffHeaders() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("127.0.0.1");

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.protectContact(request, "lead@example.com", "planos", "token"));

        assertEquals(403, exception.getStatusCode().value());
        verify(recaptchaService, never()).verifyIfProduction(anyString());
    }

    @Test
    void acceptsRequestsWithTrustedBffHeaders() {
        @SuppressWarnings("unchecked")
        ValueOperations<String, String> valueOperations = mock(ValueOperations.class);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.increment(anyString())).thenReturn(1L);
        doNothing().when(recaptchaService).verifyIfProduction("token");

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("127.0.0.1");
        request.addHeader("X-Requested-With", "escala-next-bff");
        request.addHeader("X-Escala-Bff-Secret", "shared-secret");
        request.addHeader("User-Agent", "JUnit");

        assertDoesNotThrow(() -> service.protectLead(request, "lead@example.com", "Escala", "campanha", "token"));
        verify(recaptchaService).verifyIfProduction("token");
    }

    @Test
    void rateLimitsRequestsWhenBucketIsExceeded() {
        ReflectionTestUtils.setField(service, "contactLimit", 1);
        ReflectionTestUtils.setField(service, "requireBff", false);
        when(redisTemplate.opsForValue()).thenThrow(new InvalidDataAccessResourceUsageException("Redis indisponivel"));

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("127.0.0.1");
        request.addHeader("User-Agent", "JUnit");

        assertDoesNotThrow(() -> service.protectContact(request, "lead@example.com", "planos", "token"));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> service.protectContact(request, "lead@example.com", "planos", "token"));

        assertEquals(429, exception.getStatusCode().value());
    }
}
