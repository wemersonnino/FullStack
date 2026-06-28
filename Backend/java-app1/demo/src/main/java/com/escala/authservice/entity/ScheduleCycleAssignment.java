package com.escala.authservice.entity;

import com.escala.authservice.scheduling.domain.enums.ModalidadeTrabalho;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(
        name = "schedule_cycle_assignments",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_schedule_cycle_assignment_employee_date",
                        columnNames = {"cycle_id", "employee_id", "assignmentDate"}
                )
        },
        indexes = {
                @Index(name = "idx_schedule_cycle_assignments_cycle_date", columnList = "cycle_id, assignmentDate"),
                @Index(name = "idx_schedule_cycle_assignments_public_id", columnList = "publicId")
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleCycleAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, updatable = false)
    @Builder.Default
    private UUID publicId = UUID.randomUUID();

    @ManyToOne(optional = false)
    private ScheduleCycle cycle;

    @ManyToOne(optional = false)
    private Employee employee;

    @Column(nullable = false)
    private LocalDate assignmentDate;

    @Column(nullable = false)
    private String legendCode;

    @Column(nullable = false)
    private String legendLabel;

    @Column(nullable = false)
    private String legendImpact;

    @Column(nullable = false)
    private long plannedMinutes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ModalidadeTrabalho modality = ModalidadeTrabalho.PRESENCIAL;

    @Version
    private Long version;

    @PrePersist
    void prePersist() {
        if (publicId == null) {
            publicId = UUID.randomUUID();
        }
    }
}
