package com.escala.authservice.dto;

import com.escala.authservice.entity.TeamInvitation;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class TeamInvitationResponse {
    private UUID id;
    private String email;
    private String token;
    private String roleName;
    private String companyName;
    private OffsetDateTime expiresAt;
    private OffsetDateTime acceptedAt;
    private boolean active;
    private boolean expired;

    public static TeamInvitationResponse from(TeamInvitation invitation) {
        return TeamInvitationResponse.builder()
                .id(invitation.getId())
                .email(invitation.getEmail())
                .token(invitation.getToken())
                .roleName(invitation.getRoleName())
                .companyName(invitation.getCompany().getName())
                .expiresAt(invitation.getExpiresAt())
                .acceptedAt(invitation.getAcceptedAt())
                .active(invitation.isActive())
                .expired(invitation.isExpired())
                .build();
    }
}
