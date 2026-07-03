package com.escala.authservice.service;

import com.escala.authservice.entity.AuditLog;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {
    private final AuditLogRepository auditLogRepository;
    private final CurrentUserService currentUserService;

    public void record(String actor, String action, String entityType, Object entityId, String details) {
        User user = resolveActorUser(actor);

        auditLogRepository.save(AuditLog.builder()
                .actor(actor == null || actor.isBlank() ? "system" : actor)
                .action(action)
                .entityType(entityType)
                .entityId(entityId == null ? null : String.valueOf(entityId))
                .details(details)
                .company(user == null ? null : user.getCompany())
                .build());
    }

    private User resolveActorUser(String actor) {
        try {
            return actor == null || actor.isBlank()
                    ? currentUserService.requireCurrentUser()
                    : currentUserService.requireCurrentUser(actor);
        } catch (IllegalArgumentException exception) {
            log.warn("Nao foi possivel resolver o tenant do audit log para actor={}: {}", actor, exception.getMessage());
            return null;
        }
    }
}
