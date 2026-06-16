package com.escala.authservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;

@Entity
@Table(name = "companies")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Company {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    private String cnpj; // Suporta Alfanumérico
    private String logoUrl;

    // Geofencing Fields
    private Double latitude;
    private Double longitude;

    @Builder.Default
    private Integer allowedRadius = 200; // Raio padrão de 200 metros

    private String address;
    private String cep;
    private String street;
    private String number;
    private String complement;
    private String neighborhood;
    private String city;
    private String state;

    @Builder.Default
    private String theme = "system";

    @Builder.Default
    private boolean active = true;

    // SaaS Provisioning Fields
    @Builder.Default
    private String planType = "FREE";

    private OffsetDateTime trialExpiresAt;
}
