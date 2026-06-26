package com.escala.authservice.scheduling.domain.monthly;

import java.time.Duration;

public record ScheduleCounterSnapshot(
        Long employeeId,
        int workedDays,
        int restDays,
        int absenceDays,
        int neutralDays,
        Duration plannedHours
) {
}
