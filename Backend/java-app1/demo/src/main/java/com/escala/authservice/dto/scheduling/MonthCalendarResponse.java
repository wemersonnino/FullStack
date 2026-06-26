package com.escala.authservice.dto.scheduling;

import java.util.List;

public record MonthCalendarResponse(
        int year,
        int month,
        String timezone,
        Long unitId,
        List<MonthCalendarDayResponse> days
) {
}
