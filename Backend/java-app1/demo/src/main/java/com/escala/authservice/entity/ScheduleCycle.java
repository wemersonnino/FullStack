package com.escala.authservice.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "schedule_cycles",
        indexes = {
                @Index(name = "idx_schedule_cycles_company_period", columnList = "company_id, year, month"),
                @Index(name = "idx_schedule_cycles_company_unit_period", columnList = "company_id, unitId, year, month, status")
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleCycle {
    @Id
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, unique = true, updatable = false)
    @Builder.Default
    private UUID publicId = UUID.randomUUID();

    @ManyToOne(optional = false)
    private Company company;

    private UUID unitId;

    @Column(nullable = false)
    private int year;

    @Column(nullable = false)
    private int month;

    @Column(nullable = false)
    private String timezone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ScheduleCycleStatus status = ScheduleCycleStatus.RASCUNHO;

    @Column(nullable = false)
    @Builder.Default
    private int businessVersion = 1;

    private OffsetDateTime publishedAt;

    @ManyToOne
    private User publishedBy;

    private OffsetDateTime archivedAt;

    @ManyToOne
    private User archivedBy;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    @Column(nullable = false)
    private OffsetDateTime updatedAt;

    @Version
    private Long version;

    @PrePersist
    void prePersist() {
        if (publicId == null) {
            publicId = UUID.randomUUID();
        }
        OffsetDateTime now = OffsetDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
