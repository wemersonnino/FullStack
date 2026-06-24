package com.escala.authservice.service;

import com.escala.authservice.entity.AuditLog;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.AuditLogRepository;
import com.escala.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditLogService {
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public void record(String actor, String action, String entityType, Object entityId, String details) {
        User user = actor == null || actor.isBlank()
                ? null
                : userRepository.findByEmail(actor).orElse(null);

        auditLogRepository.save(AuditLog.builder()
                .actor(actor == null || actor.isBlank() ? "system" : actor)
                .action(action)
                .entityType(entityType)
                .entityId(entityId == null ? null : String.valueOf(entityId))
                .details(details)
                .company(user == null ? null : user.getCompany())
                .build());
    }
}
