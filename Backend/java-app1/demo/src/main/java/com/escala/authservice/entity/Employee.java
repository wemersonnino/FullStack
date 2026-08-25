package com.escala.authservice.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Locale;
import java.util.UUID;

@Entity
@org.hibernate.annotations.Filter(name = "tenantFilter", condition = "company_id = :tenantId")
@Table(
    name = "employees",
    indexes = {
        @Index(name = "idx_employees_company_active_name", columnList = "company_id, active, full_name"),
        @Index(name = "idx_employees_company_sector_active", columnList = "company_id, sector_id, active"),
        @Index(name = "idx_employees_company_project_active", columnList = "company_id, project_id, active")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Employee {
    @Id
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, unique = true, updatable = false)
    @Builder.Default
    private UUID publicId = UUID.randomUUID();

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String email;

    @Builder.Default
    private boolean active = true;

    @ManyToOne
    private Sector sector;

    @ManyToOne
    private Project project;

    @OneToOne
    private User user;

    @ManyToOne
    private Company company;

    @PrePersist
    void prePersist() {
        if (publicId == null) {
            publicId = UUID.randomUUID();
        }
        if (email != null) {
            email = email.trim().toLowerCase(Locale.ROOT);
        }
        if (fullName != null) {
            fullName = fullName.trim();
        }
    }

    @PreUpdate
    void preUpdate() {
        if (email != null) {
            email = email.trim().toLowerCase(Locale.ROOT);
        }
        if (fullName != null) {
            fullName = fullName.trim();
        }
    }
}
