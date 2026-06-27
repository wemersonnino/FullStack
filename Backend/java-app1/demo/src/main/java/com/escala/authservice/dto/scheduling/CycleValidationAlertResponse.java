package com.escala.authservice.dto.scheduling;

import java.time.LocalDate;

public record CycleValidationAlertResponse(
        String id,
        String severity,
        String ruleCode,
        String message,
        Long employeeId,
        String employeeName,
        LocalDate date
) {
}
