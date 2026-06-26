package com.escala.authservice.dto.scheduling;

import java.time.LocalDate;

public record HolidayResponse(
        Long id,
        LocalDate date,
        String name,
        String type,
        Long unitId
) {
}
