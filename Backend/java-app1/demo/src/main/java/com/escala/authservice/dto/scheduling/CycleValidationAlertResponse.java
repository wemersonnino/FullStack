package com.escala.authservice.dto.scheduling;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public record CycleValidationAlertResponse(
        String id,
        String severity,
        String ruleCode,
        String message,
        String employeeId,
        String employeeName,
        LocalDate date,
        boolean acknowledged,
        OffsetDateTime acknowledgedAt
) {
}
