package com.escala.authservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "sectors",
        indexes = {
                @Index(name = "idx_sectors_company_manager", columnList = "company_id, manager_id")
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Sector {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    private Integer maxSeats;

    @ManyToOne
    private Company company;

    @ManyToOne
    @JoinColumn(name = "manager_id")
    private User manager;
}
