package com.escala.authservice.dto.audit;

import com.escala.authservice.entity.AuditLog;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@Builder
public class AuditLogResponse {
    private Long id;
    private String actor;
    private String action;
    private String entityType;
    private String entityId;
    private String details;
    private OffsetDateTime createdAt;

    public static AuditLogResponse from(AuditLog log) {
        return AuditLogResponse.builder()
                .id(log.getId())
                .actor(log.getActor())
                .action(log.getAction())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .details(log.getDetails())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
