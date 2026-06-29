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
    private String roleName;
    private String companyName;
    private String companySlug;
    private String inviteUrl;
    private OffsetDateTime expiresAt;
    private OffsetDateTime acceptedAt;
    private boolean active;
    private boolean expired;

    public static TeamInvitationResponse forAdmin(TeamInvitation invitation, String inviteUrl) {
        return TeamInvitationResponse.builder()
                .id(invitation.getId())
                .email(invitation.getEmail())
                .roleName(invitation.getRoleName())
                .companyName(invitation.getCompany().getName())
                .companySlug(invitation.getCompany().getSlug())
                .inviteUrl(inviteUrl)
                .expiresAt(invitation.getExpiresAt())
                .acceptedAt(invitation.getAcceptedAt())
                .active(invitation.isActive())
                .expired(invitation.isExpired())
                .build();
    }

    public static TeamInvitationResponse forPublic(TeamInvitation invitation) {
        return TeamInvitationResponse.builder()
                .id(invitation.getId())
                .email(invitation.getEmail())
                .roleName(invitation.getRoleName())
                .companyName(invitation.getCompany().getName())
                .companySlug(invitation.getCompany().getSlug())
                .expiresAt(invitation.getExpiresAt())
                .acceptedAt(invitation.getAcceptedAt())
                .active(invitation.isActive())
                .expired(invitation.isExpired())
                .build();
    }
}
