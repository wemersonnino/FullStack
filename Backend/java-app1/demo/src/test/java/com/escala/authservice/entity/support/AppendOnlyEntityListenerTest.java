package com.escala.authservice.entity.support;

import com.escala.authservice.entity.AuditLog;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class AppendOnlyEntityListenerTest {

    private final AppendOnlyEntityListener listener = new AppendOnlyEntityListener();

    @Test
    void blocksEntityUpdate() {
        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> listener.blockUpdate(AuditLog.builder().actor("system").action("A").entityType("T").build())
        );

        assertEquals("AuditLog is append-only and cannot be updated", exception.getMessage());
    }

    @Test
    void blocksEntityDelete() {
        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> listener.blockDelete(AuditLog.builder().actor("system").action("A").entityType("T").build())
        );

        assertEquals("AuditLog is append-only and cannot be deleted", exception.getMessage());
    }
}
