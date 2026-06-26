package com.escala.authservice.dto.scheduling;

public record LegendResponse(
        String code,
        String label,
        String impact,
        long plannedMinutes
) {
}
