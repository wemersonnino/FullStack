package com.escala.authservice.entity;

import java.util.UUID;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
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
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    @GeneratedValue
    private UUID id;

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
