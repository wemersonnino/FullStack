package com.escala.authservice.integration;

import com.escala.authservice.dto.TeamInvitationRequest;
import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.TeamInvitation;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.TeamInvitationRepository;
import com.escala.authservice.service.TeamInvitationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

class TeamInvitationIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private TeamInvitationService teamInvitationService;

    @Autowired
    private TeamInvitationRepository teamInvitationRepository;

    @Test
    void hashesIssuedTokenAndDisablesPreviousInvitationInSameTenant() {
        Company company = persistCompany("empresa-a");
        User owner = persistUser(company, "owner@empresa-a.com", "owner-a", "OWNER");

        TeamInvitationRequest request = new TeamInvitationRequest();
        request.setEmail("new.user@empresa-a.com");
        request.setRoleName("USER");

        TeamInvitationService.IssuedInvitation firstIssued = teamInvitationService.invite(owner.getEmail(), request);
        TeamInvitation firstInvitation = teamInvitationRepository.findById(firstIssued.invitation().getId()).orElseThrow();

        TeamInvitationService.IssuedInvitation secondIssued = teamInvitationService.invite(owner.getEmail(), request);
        TeamInvitation secondInvitation = teamInvitationRepository.findById(secondIssued.invitation().getId()).orElseThrow();
        firstInvitation = teamInvitationRepository.findById(firstIssued.invitation().getId()).orElseThrow();

        assertThat(firstIssued.plainToken()).isNotBlank();
        assertThat(firstInvitation.getToken()).isNull();
        assertThat(firstInvitation.getTokenHash()).hasSize(64);
        assertThat(firstInvitation.getTokenPreview()).isNotBlank();
        assertThat(firstInvitation.isActive()).isFalse();

        assertThat(secondIssued.plainToken()).isNotBlank();
        assertThat(secondInvitation.getTokenHash()).hasSize(64);
        assertThat(secondInvitation.getTokenPreview()).isNotBlank();
        assertThat(secondInvitation.isActive()).isTrue();

        TeamInvitation resolvedByToken = teamInvitationService.findByToken(secondIssued.plainToken());
        assertThat(resolvedByToken.getId()).isEqualTo(secondInvitation.getId());
        assertThat(teamInvitationRepository.findByCompanyId(company.getId())).hasSize(2);
    }
}
