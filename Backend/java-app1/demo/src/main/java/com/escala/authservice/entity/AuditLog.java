package com.escala.authservice.entity;

import com.escala.authservice.entity.support.AppendOnlyEntityListener;
import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@org.hibernate.annotations.Filter(name = "tenantFilter", condition = "company_id = :tenantId")
@EntityListeners(AppendOnlyEntityListener.class)
@Table(
        name = "audit_logs",
        indexes = {
                @Index(name = "idx_audit_logs_company_created_at", columnList = "company_id, created_at"),
                @Index(name = "idx_audit_logs_company_action", columnList = "company_id, action")
        }
)
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class AuditLog {
    @Id
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, updatable = false)
    private String actor;

    @Column(nullable = false, updatable = false)
    private String action;

    @Column(nullable = false, updatable = false)
    private String entityType;

    @Column(updatable = false)
    private String entityId;

    @Column(length = 4000, updatable = false)
    private String details;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", updatable = false)
    private Company company;

    @Builder.Default
    @Column(nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @PrePersist
    void initializeCreatedAt() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
    }
}
