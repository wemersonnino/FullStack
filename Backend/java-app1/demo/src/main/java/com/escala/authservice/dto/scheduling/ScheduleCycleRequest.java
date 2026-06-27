package com.escala.authservice.dto.scheduling;

public record ScheduleCycleRequest(
        int year,
        int month,
        Long unitId,
        String timezone
) {
}
