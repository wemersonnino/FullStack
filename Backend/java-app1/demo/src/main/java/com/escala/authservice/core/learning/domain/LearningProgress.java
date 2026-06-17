package com.escala.authservice.core.learning.domain;

import lombok.Builder;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
@Builder
public class LearningProgress {
    private Long id;
    private Long userId;
    private String module;
    private String topic;
    private boolean completed;
    private OffsetDateTime completionDate;
    private String notes;
}
