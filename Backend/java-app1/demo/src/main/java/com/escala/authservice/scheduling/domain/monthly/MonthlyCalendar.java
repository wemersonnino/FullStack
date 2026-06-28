package com.escala.authservice.scheduling.domain.monthly;

import java.time.YearMonth;
import java.util.UUID;
import java.time.ZoneId;
import java.util.List;
import java.util.Objects;

public record MonthlyCalendar(
        int year,
        int month,
        ZoneId timezone,
        UUID unitId,
        List<MonthlyCalendarDay> days
) {
    public MonthlyCalendar {
        YearMonth.of(year, month);
        Objects.requireNonNull(timezone, "timezone is required");
        days = List.copyOf(Objects.requireNonNull(days, "days are required"));
    }

    public YearMonth yearMonth() {
        return YearMonth.of(year, month);
    }
}
