package com.escala.authservice.dto.scheduling;

import java.time.LocalDate;
import java.util.UUID;

public record HolidayResponse(
        String id,
        LocalDate date,
        String name,
        String type,
        UUID unitId
) {
}
