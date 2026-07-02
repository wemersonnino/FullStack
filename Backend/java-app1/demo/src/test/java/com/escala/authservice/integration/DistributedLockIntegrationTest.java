package com.escala.authservice.integration;

import com.escala.authservice.service.DistributedLockService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DistributedLockIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private DistributedLockService distributedLockService;

    @Test
    void acquiresAndReleasesScheduleCycleLockUsingRedis() {
        UUID cyclePublicId = UUID.randomUUID();

        DistributedLockService.LockHandle first = distributedLockService.acquireScheduleCycleLock(cyclePublicId, "publish");

        assertThat(first.localFallback()).isFalse();
        assertThatThrownBy(() -> distributedLockService.acquireScheduleCycleLock(cyclePublicId, "publish"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("operacao concorrente");

        distributedLockService.release(first);

        DistributedLockService.LockHandle second = distributedLockService.acquireScheduleCycleLock(cyclePublicId, "publish");
        assertThat(second.localFallback()).isFalse();
        distributedLockService.release(second);
    }
}
