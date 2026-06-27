package com.escala.authservice.dto.scheduling;

import java.time.OffsetDateTime;

public record ScheduleCycleResponse(
        String id,
        int year,
        int month,
        Long unitId,
        String timezone,
        String status,
        int businessVersion,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
