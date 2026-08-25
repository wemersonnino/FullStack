package com.escala.authservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class DistributedLockService {
    private final StringRedisTemplate redisTemplate;

    private final Map<String, Long> localLocks = new ConcurrentHashMap<>();

    @Value("${application.locks.schedule-generate-ttl:PT2M}")
    private Duration scheduleGenerateTtl;

    @Value("${application.locks.schedule-cycle-ttl:PT1M}")
    private Duration scheduleCycleTtl;

    public LockHandle acquireScheduleGenerationLock(UUID companyId, int year, int month) {
        return acquire(lockKey("schedule-generate", companyId + ":" + year + ":" + month), scheduleGenerateTtl);
    }

    public LockHandle acquireScheduleCycleLock(UUID cyclePublicId, String action) {
        return acquire(lockKey("schedule-cycle", cyclePublicId + ":" + action), scheduleCycleTtl);
    }

    private LockHandle acquire(String key, Duration ttl) {
        String value = UUID.randomUUID().toString();

        try {
            Boolean acquired = redisTemplate.opsForValue().setIfAbsent(key, value, ttl);
            if (Boolean.TRUE.equals(acquired)) {
                return new LockHandle(key, value, false);
            }
            throw new IllegalStateException("Ja existe uma operacao concorrente em andamento para este recurso");
        } catch (DataAccessException ignored) {
            // Fallback local para development/test quando Redis nao estiver disponivel.
        }

        long now = System.currentTimeMillis();
        long expiresAt = now + ttl.toMillis();
        Long existing = localLocks.putIfAbsent(key, expiresAt);
        if (existing == null || existing < now) {
            localLocks.put(key, expiresAt);
            return new LockHandle(key, value, true);
        }

        throw new IllegalStateException("Ja existe uma operacao concorrente em andamento para este recurso");
    }

    public void release(LockHandle handle) {
        if (handle == null) {
            return;
        }

        if (handle.localFallback()) {
            localLocks.remove(handle.key());
            return;
        }

        try {
            String currentValue = redisTemplate.opsForValue().get(handle.key());
            if (handle.value().equals(currentValue)) {
                redisTemplate.delete(handle.key());
            }
        } catch (DataAccessException ignored) {
            localLocks.remove(handle.key());
        }
    }

    private String lockKey(String namespace, String id) {
        return "escala:" + namespace + ":" + id;
    }

    public record LockHandle(String key, String value, boolean localFallback) {
    }
}
