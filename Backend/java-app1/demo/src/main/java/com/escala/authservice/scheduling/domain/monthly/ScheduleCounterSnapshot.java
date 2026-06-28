package com.escala.authservice.scheduling.domain.monthly;

import java.time.Duration;
import java.util.UUID;

public record ScheduleCounterSnapshot(
        UUID employeeId,
        int workedDays,
        int restDays,
        int absenceDays,
        int neutralDays,
        Duration plannedHours
) {
}
