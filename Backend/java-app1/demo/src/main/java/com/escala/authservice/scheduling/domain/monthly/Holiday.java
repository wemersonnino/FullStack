package com.escala.authservice.scheduling.domain.monthly;

import java.time.LocalDate;
import java.util.Objects;

public record Holiday(
        LocalDate date,
        String name,
        HolidayType type,
        Long unitId
) {
    public Holiday {
        Objects.requireNonNull(date, "date is required");
        Objects.requireNonNull(type, "type is required");
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Holiday name is required");
        }
    }

    public boolean appliesTo(Long requestedUnitId) {
        return unitId == null || Objects.equals(unitId, requestedUnitId);
    }
}
