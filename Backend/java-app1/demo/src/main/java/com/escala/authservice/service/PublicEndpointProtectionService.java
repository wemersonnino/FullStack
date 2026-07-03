package com.escala.authservice.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class PublicEndpointProtectionService {

    private static final String INTERNAL_BFF_HEADER = "X-Escala-Bff-Secret";
    private static final String REQUESTED_WITH_HEADER = "X-Requested-With";
    private static final String EXPECTED_REQUESTED_WITH = "escala-next-bff";

    private final StringRedisTemplate redisTemplate;
    private final RecaptchaService recaptchaService;

    private final Map<String, LocalBucket> localBuckets = new ConcurrentHashMap<>();

    @Value("${application.security.public-endpoints.require-bff:true}")
    private boolean requireBff;

    @Value("${application.security.public-endpoints.bff-shared-secret:}")
    private String bffSharedSecret;

    @Value("${application.security.public-endpoints.contact.limit:10}")
    private int contactLimit;

    @Value("${application.security.public-endpoints.contact.window:PT15M}")
    private Duration contactWindow;

    @Value("${application.security.public-endpoints.leads.limit:12}")
    private int leadLimit;

    @Value("${application.security.public-endpoints.leads.window:PT15M}")
    private Duration leadWindow;

    public void protectContact(HttpServletRequest request, String email, String subject, String recaptchaToken) {
        protect(request, "contact", contactLimit, contactWindow, recaptchaToken, email, subject);
    }

    public void protectLead(HttpServletRequest request, String email, String companyName, String campaignSlug, String recaptchaToken) {
        protect(request, "leads", leadLimit, leadWindow, recaptchaToken, email, companyName, campaignSlug);
    }

    private void protect(
            HttpServletRequest request,
            String namespace,
            int limit,
            Duration window,
            String recaptchaToken,
            String... keyParts
    ) {
        requireTrustedBff(request);

        long count = incrementCounter(rateLimitKey(namespace, request, window, keyParts), window);
        if (count > limit) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Muitas tentativas para esta operacao. Aguarde e tente novamente.");
        }

        recaptchaService.verifyIfProduction(recaptchaToken);
    }

    private void requireTrustedBff(HttpServletRequest request) {
        if (!requireBff) {
            return;
        }

        if (bffSharedSecret == null || bffSharedSecret.isBlank()) {
            throw new IllegalStateException("Segredo interno do BFF nao configurado");
        }

        String requestedWith = request.getHeader(REQUESTED_WITH_HEADER);
        if (!EXPECTED_REQUESTED_WITH.equals(requestedWith)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Endpoint publico disponivel apenas via BFF");
        }

        String providedSecret = request.getHeader(INTERNAL_BFF_HEADER);
        if (providedSecret == null || !MessageDigest.isEqual(
                providedSecret.getBytes(StandardCharsets.UTF_8),
                bffSharedSecret.getBytes(StandardCharsets.UTF_8)
        )) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Endpoint publico disponivel apenas via BFF");
        }
    }

    private String rateLimitKey(String namespace, HttpServletRequest request, Duration window, String... keyParts) {
        long bucket = Math.floorDiv(System.currentTimeMillis(), Math.max(1L, window.toMillis()));
        String remoteAddress = normalize(request.getRemoteAddr(), "unknown");
        String userAgent = normalize(request.getHeader("User-Agent"), "unknown-agent");
        StringBuilder keyBuilder = new StringBuilder("escala:public:")
                .append(namespace)
                .append(':')
                .append(bucket)
                .append(':')
                .append(remoteAddress)
                .append('|')
                .append(userAgent);

        for (String keyPart : keyParts) {
            String normalized = normalize(keyPart, null);
            if (normalized != null) {
                keyBuilder.append('|').append(normalized);
            }
        }

        return keyBuilder.toString();
    }

    private String normalize(String value, String fallback) {
        if (value == null) {
            return fallback;
        }

        String trimmed = value.trim().toLowerCase();
        return trimmed.isBlank() ? fallback : trimmed;
    }

    private long incrementCounter(String key, Duration window) {
        try {
            Long count = redisTemplate.opsForValue().increment(key);
            if (count != null && count == 1L) {
                redisTemplate.expire(key, window);
            }
            if (count != null) {
                return count;
            }
        } catch (DataAccessException ignored) {
            // Fallback local para development/test quando Redis nao estiver disponivel.
        }

        return incrementLocalCounter(key, window);
    }

    private long incrementLocalCounter(String key, Duration window) {
        long now = System.currentTimeMillis();
        long expiresAt = now + window.toMillis();

        LocalBucket bucket = localBuckets.compute(key, (currentKey, existing) -> {
            if (existing == null || existing.expiresAt() <= now) {
                return new LocalBucket(1L, expiresAt);
            }
            return new LocalBucket(existing.count() + 1L, existing.expiresAt());
        });

        cleanupExpiredBuckets(now);
        return bucket.count();
    }

    private void cleanupExpiredBuckets(long now) {
        if (localBuckets.size() < 500) {
            return;
        }

        localBuckets.entrySet().removeIf(entry -> entry.getValue().expiresAt() <= now);
    }

    private record LocalBucket(long count, long expiresAt) {
    }
}
