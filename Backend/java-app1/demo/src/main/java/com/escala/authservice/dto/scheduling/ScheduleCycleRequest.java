package com.escala.authservice.dto.scheduling;

import java.util.UUID;

public record ScheduleCycleRequest(
        int year,
        int month,
        UUID unitId,
        String timezone
) {
}
