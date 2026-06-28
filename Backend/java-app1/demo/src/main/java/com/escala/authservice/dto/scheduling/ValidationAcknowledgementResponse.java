package com.escala.authservice.dto.scheduling;

import java.time.OffsetDateTime;

public record ValidationAcknowledgementResponse(
        String id,
        String alertId,
        String ruleCode,
        String severity,
        String acknowledgedBy,
        String reason,
        OffsetDateTime acknowledgedAt
) {
}
