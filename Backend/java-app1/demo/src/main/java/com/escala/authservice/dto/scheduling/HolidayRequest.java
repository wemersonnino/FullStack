package com.escala.authservice.dto.scheduling;

import com.escala.authservice.scheduling.domain.monthly.HolidayType;

import java.time.LocalDate;

public record HolidayRequest(
        LocalDate date,
        String name,
        HolidayType type,
        Long unitId
) {
}
