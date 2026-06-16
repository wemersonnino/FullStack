package com.escala.authservice.entity;

import com.escala.authservice.scheduling.domain.enums.PadraoEscala;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(
        name = "work_shifts",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_work_shift_employee_date", columnNames = {"employee_id", "shiftDate"})
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkShift {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Employee employee;

    @Column(nullable = false)
    private LocalDate shiftDate;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ShiftStatus status = ShiftStatus.SCHEDULED;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false)
    private WorkMode workMode = WorkMode.PRESENCIAL;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PadraoEscala padraoEscala = PadraoEscala.COMUM;

    private String notes;
}
