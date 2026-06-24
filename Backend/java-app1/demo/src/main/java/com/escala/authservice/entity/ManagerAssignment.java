package com.escala.authservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Entity
@Table(
        name = "manager_assignments",
        indexes = {
                @Index(name = "idx_manager_assignments_company_manager_active", columnList = "company_id, manager_user_id, active"),
                @Index(name = "idx_manager_assignments_scope", columnList = "company_id, scopeType, scopeId, active")
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManagerAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_user_id")
    private User manager;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ManagerScopeType scopeType;

    @Column(nullable = false)
    private Long scopeId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ManagerRoleLevel roleLevel;

    @Column(nullable = false)
    private int levelWeight;

    private OffsetDateTime startsAt;
    private OffsetDateTime endsAt;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;
}
