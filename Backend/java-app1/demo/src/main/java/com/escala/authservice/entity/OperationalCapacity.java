package com.escala.authservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "operational_capacities")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OperationalCapacity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID targetId; // ID do Setor ou Posto de Trabalho

    @Column(nullable = false)
    private String targetType; // "SECTOR" ou "WORK_POST"

    @Column(nullable = false)
    private Integer dayOfWeek; // 1 = Segunda-feira, 7 = Domingo

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Column(nullable = false)
    private Integer minEmployeesRequired;

    @ManyToOne(optional = false)
    private Company company;
}
