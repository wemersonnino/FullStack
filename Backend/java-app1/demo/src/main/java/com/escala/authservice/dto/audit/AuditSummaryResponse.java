package com.escala.authservice.dto.audit;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@Builder
public class AuditSummaryResponse {
    private long eventsToday;
    private long totalEvents;
    private int integrityPercent;
    private OffsetDateTime lastEventAt;
}
