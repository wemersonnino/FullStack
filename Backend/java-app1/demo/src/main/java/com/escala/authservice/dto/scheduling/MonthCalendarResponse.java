package com.escala.authservice.dto.scheduling;

import java.util.List;
import java.util.UUID;

public record MonthCalendarResponse(
        int year,
        int month,
        String timezone,
        UUID unitId,
        List<MonthCalendarDayResponse> days
) {
}
