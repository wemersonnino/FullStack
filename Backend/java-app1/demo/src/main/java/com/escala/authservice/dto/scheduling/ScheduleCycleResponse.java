package com.escala.authservice.dto.scheduling;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ScheduleCycleResponse(
        String id,
        int year,
        int month,
        UUID unitId,
        String timezone,
        String status,
        int businessVersion,
        OffsetDateTime publishedAt,
        String publishedBy,
        OffsetDateTime archivedAt,
        String archivedBy,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
