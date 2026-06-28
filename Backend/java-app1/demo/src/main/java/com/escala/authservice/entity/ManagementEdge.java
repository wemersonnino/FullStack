package com.escala.authservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "management_edges",
        indexes = {
                @Index(name = "idx_management_edges_parent", columnList = "company_id, parent_user_id"),
                @Index(name = "idx_management_edges_child", columnList = "company_id, child_user_id")
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManagementEdge {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_user_id")
    private User parent;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "child_user_id")
    private User child;

    @Column(nullable = false)
    private String relationType;

    private OffsetDateTime startsAt;
    private OffsetDateTime endsAt;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;
}
