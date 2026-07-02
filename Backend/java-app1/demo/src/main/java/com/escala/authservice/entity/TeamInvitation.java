package com.escala.authservice.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "team_invitations",
    indexes = {
        @Index(name = "idx_team_invitations_company_email_active", columnList = "company_id, email, active"),
        @Index(name = "idx_team_invitations_expires_at", columnList = "expires_at")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamInvitation {

    @Id
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String email;

    @Column(unique = true)
    private String token;

    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Column(name = "token_preview", length = 12)
    private String tokenPreview;

    @Column(nullable = false)
    private String roleName; // OWNER, MANAGER, USER

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne
    @JoinColumn(name = "invited_by_id", nullable = false)
    private User invitedBy;

    @Column(nullable = false)
    private OffsetDateTime expiresAt;

    private OffsetDateTime acceptedAt;

    @Builder.Default
    private boolean active = true;

    public boolean isExpired() {
        return OffsetDateTime.now().isAfter(expiresAt);
    }

    public boolean isUsable() {
        return active && acceptedAt == null && !isExpired();
    }
}
