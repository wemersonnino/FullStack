package com.escala.authservice.scheduling.domain.monthly;

import java.time.Duration;
import java.util.Objects;

public record LegendCode(
        String code,
        String label,
        LegendImpact impact,
        Duration plannedHours
) {
    public LegendCode {
        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("Legend code is required");
        }
        if (label == null || label.isBlank()) {
            throw new IllegalArgumentException("Legend label is required");
        }
        Objects.requireNonNull(impact, "impact is required");
        plannedHours = plannedHours == null ? Duration.ZERO : plannedHours;
        if (plannedHours.isNegative()) {
            throw new IllegalArgumentException("Planned hours cannot be negative");
        }
    }
}
