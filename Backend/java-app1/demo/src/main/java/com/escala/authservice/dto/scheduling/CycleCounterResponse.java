package com.escala.authservice.dto.scheduling;

public record CycleCounterResponse(
        Long employeeId,
        String employeeName,
        int workedDays,
        int restDays,
        int absenceDays,
        int neutralDays,
        long plannedMinutes
) {
}
