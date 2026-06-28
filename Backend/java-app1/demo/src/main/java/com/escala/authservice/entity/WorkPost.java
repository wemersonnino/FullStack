package com.escala.authservice.entity;

import java.util.UUID;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "work_posts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkPost {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String description;

    @ManyToOne
    private Company company;

    @ManyToOne
    private Project project;
}
