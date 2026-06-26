package com.escala.authservice.dto.scheduling;

import java.time.LocalDate;

public record MonthCalendarDayResponse(
        LocalDate date,
        boolean weekend,
        boolean holiday,
        String holidayName,
        String holidayType
) {
}
