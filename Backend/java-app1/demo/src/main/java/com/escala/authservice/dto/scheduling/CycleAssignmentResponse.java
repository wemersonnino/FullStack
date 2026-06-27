package com.escala.authservice.dto.scheduling;

import java.time.LocalDate;

public record CycleAssignmentResponse(
        String id,
        Long employeeId,
        String employeeName,
        LocalDate date,
        String legendCode,
        String legendLabel,
        String legendImpact,
        long plannedMinutes,
        String modality
) {
}
