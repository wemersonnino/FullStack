package com.escala.authservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "schedule_validation_acknowledgements",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_schedule_validation_ack_cycle_alert",
                        columnNames = {"cycle_id", "alertId"}
                )
        },
        indexes = {
                @Index(name = "idx_schedule_validation_ack_cycle", columnList = "cycle_id")
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleValidationAcknowledgement {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, updatable = false)
    @Builder.Default
    private UUID publicId = UUID.randomUUID();

    @ManyToOne(optional = false)
    private ScheduleCycle cycle;

    @Column(nullable = false)
    private String alertId;

    @Column(nullable = false)
    private String ruleCode;

    @Column(nullable = false)
    private String severity;

    @ManyToOne(optional = false)
    private User acknowledgedBy;

    private String reason;

    @Column(nullable = false)
    private OffsetDateTime acknowledgedAt;

    @Version
    private Long version;

    @PrePersist
    void prePersist() {
        if (publicId == null) {
            publicId = UUID.randomUUID();
        }
        if (acknowledgedAt == null) {
            acknowledgedAt = OffsetDateTime.now();
        }
    }
}
