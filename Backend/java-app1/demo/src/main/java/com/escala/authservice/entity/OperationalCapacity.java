package com.escala.authservice.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
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
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    @GeneratedValue
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

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;

    @ManyToOne(optional = false)
    private Company company;
}
