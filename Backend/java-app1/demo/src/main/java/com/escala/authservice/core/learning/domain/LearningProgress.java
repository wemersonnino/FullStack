package com.escala.authservice.core.learning.domain;

import lombok.Builder;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class LearningProgress {
    private UUID id;
    private UUID userId;
    private String module;
    private String topic;
    private boolean completed;
    private OffsetDateTime completionDate;
    private String notes;
}
