package com.escala.authservice.service;

import com.escala.authservice.entity.AuditLog;
import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.AuditLogRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuditLogServiceTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private CurrentUserService currentUserService;

    @InjectMocks
    private AuditLogService auditLogService;

    @Test
    void recordUsesAuthenticatedTenantContextWhenAvailable() {
        Company company = Company.builder().id(UUID.randomUUID()).name("Tenant A").slug("tenant-a").build();
        User user = User.builder()
                .id(UUID.randomUUID())
                .email("admin@tenant-a.com")
                .company(company)
                .build();

        when(currentUserService.requireCurrentUser("admin@tenant-a.com")).thenReturn(user);

        auditLogService.record("admin@tenant-a.com", "SHIFT_UPDATED", "WorkShift", UUID.randomUUID(), "ok");

        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(captor.capture());
        AuditLog saved = captor.getValue();

        assertEquals("admin@tenant-a.com", saved.getActor());
        assertEquals(company, saved.getCompany());
        assertEquals("SHIFT_UPDATED", saved.getAction());
    }

    @Test
    void recordAvoidsWrongTenantAssociationWhenActorResolutionIsAmbiguous() {
        when(currentUserService.requireCurrentUser("shared@example.com"))
                .thenThrow(new IllegalArgumentException("Email ambiguo entre tenants"));

        auditLogService.record("shared@example.com", "SHIFT_UPDATED", "WorkShift", UUID.randomUUID(), "ok");

        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(captor.capture());
        AuditLog saved = captor.getValue();

        assertEquals("shared@example.com", saved.getActor());
        assertNull(saved.getCompany());
    }
}
