package com.escala.authservice.scheduling.domain.monthly;

import java.time.LocalDate;
import java.util.Objects;

public record MonthlyCalendarDay(
        LocalDate date,
        boolean weekend,
        Holiday holiday
) {
    public MonthlyCalendarDay {
        Objects.requireNonNull(date, "date is required");
    }

    public boolean holidayApplied() {
        return holiday != null;
    }
}
