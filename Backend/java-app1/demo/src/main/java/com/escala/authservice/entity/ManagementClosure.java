package com.escala.authservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "management_closure",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_management_closure_path", columnNames = {"company_id", "ancestor_user_id", "descendant_user_id"})
        },
        indexes = {
                @Index(name = "idx_management_closure_ancestor", columnList = "company_id, ancestor_user_id"),
                @Index(name = "idx_management_closure_descendant", columnList = "company_id, descendant_user_id")
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManagementClosure {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "ancestor_user_id")
    private User ancestor;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "descendant_user_id")
    private User descendant;

    @Column(nullable = false)
    private int depth;

    @Column(nullable = false)
    private int maxWeightPath;
}
