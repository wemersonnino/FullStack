package com.escala.authservice.service;

import com.escala.authservice.dto.TeamInvitationRequest;
import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.Role;
import com.escala.authservice.entity.TeamInvitation;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.TeamInvitationRepository;
import com.escala.authservice.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TeamInvitationServiceTest {

    @Mock
    private TeamInvitationRepository invitationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PolicyService policyService;

    @Mock
    private CurrentUserService currentUserService;

    @Mock
    private SensitiveTokenService sensitiveTokenService;

    @InjectMocks
    private TeamInvitationService teamInvitationService;

    @Test
    void inviteNormalizesEmailAndRole() {
        Company company = Company.builder().id(UUID.randomUUID()).slug("empresa-a").name("Empresa A").build();
        User inviter = User.builder()
                .email("owner@example.com")
                .company(company)
                .roles(Set.of(Role.builder().name("OWNER").build()))
                .build();

        TeamInvitationRequest request = new TeamInvitationRequest();
        request.setEmail(" USER@Example.com ");
        request.setRoleName("manager");

        when(currentUserService.requireCurrentUser("owner@example.com")).thenReturn(inviter);
        when(userRepository.existsByCompanyIdAndEmailIgnoreCase(company.getId(), "user@example.com")).thenReturn(false);
        when(invitationRepository.findAllByEmailIgnoreCaseAndCompanyId("user@example.com", company.getId())).thenReturn(List.of());
        when(sensitiveTokenService.issue()).thenReturn(new SensitiveTokenService.IssuedToken("plain", "hash", "prev1234"));
        when(invitationRepository.save(any(TeamInvitation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        teamInvitationService.invite("owner@example.com", request);

        ArgumentCaptor<TeamInvitation> captor = ArgumentCaptor.forClass(TeamInvitation.class);
        verify(invitationRepository).save(captor.capture());
        assertEquals("user@example.com", captor.getValue().getEmail());
        assertEquals("MANAGER", captor.getValue().getRoleName());
    }

    @Test
    void inviteRejectsOwnerInviteFromNonOwner() {
        Company company = Company.builder().id(UUID.randomUUID()).slug("empresa-a").name("Empresa A").build();
        User inviter = User.builder()
                .email("admin@example.com")
                .company(company)
                .roles(Set.of(Role.builder().name("ADMIN").build()))
                .build();

        TeamInvitationRequest request = new TeamInvitationRequest();
        request.setEmail("user@example.com");
        request.setRoleName("OWNER");

        when(currentUserService.requireCurrentUser("admin@example.com")).thenReturn(inviter);
        when(policyService.isOwner(inviter)).thenReturn(false);

        assertThrows(AccessDeniedException.class, () -> teamInvitationService.invite("admin@example.com", request));
    }

    @Test
    void inviteRejectsEmailAlreadyLinkedToSameCompany() {
        Company companyA = Company.builder().id(UUID.randomUUID()).slug("empresa-a").name("Empresa A").build();
        User inviter = User.builder()
                .email("owner@example.com")
                .company(companyA)
                .roles(Set.of(Role.builder().name("OWNER").build()))
                .build();
        TeamInvitationRequest request = new TeamInvitationRequest();
        request.setEmail("user@example.com");
        request.setRoleName("USER");

        when(currentUserService.requireCurrentUser("owner@example.com")).thenReturn(inviter);
        when(userRepository.existsByCompanyIdAndEmailIgnoreCase(companyA.getId(), "user@example.com")).thenReturn(true);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> teamInvitationService.invite("owner@example.com", request)
        );

        assertEquals(400, exception.getStatusCode().value());
        assertEquals("Este email ja pertence a um usuario desta empresa", exception.getReason());
    }

    @Test
    void inviteDisablesPreviousInvitationsInSameCompanyBeforeIssuingNewOne() {
        Company companyA = Company.builder().id(UUID.randomUUID()).slug("empresa-a").name("Empresa A").build();
        User inviter = User.builder()
                .email("owner@example.com")
                .company(companyA)
                .roles(Set.of(Role.builder().name("OWNER").build()))
                .build();
        TeamInvitationRequest request = new TeamInvitationRequest();
        request.setEmail("user@example.com");
        request.setRoleName("USER");
        TeamInvitation activeInvitation = TeamInvitation.builder()
                .email("user@example.com")
                .company(companyA)
                .active(true)
                .expiresAt(OffsetDateTime.now().plusDays(2))
                .build();

        when(currentUserService.requireCurrentUser("owner@example.com")).thenReturn(inviter);
        when(userRepository.existsByCompanyIdAndEmailIgnoreCase(companyA.getId(), "user@example.com")).thenReturn(false);
        when(invitationRepository.findAllByEmailIgnoreCaseAndCompanyId("user@example.com", companyA.getId()))
                .thenReturn(List.of(activeInvitation));
        when(sensitiveTokenService.issue()).thenReturn(new SensitiveTokenService.IssuedToken("plain", "hash", "prev1234"));
        when(invitationRepository.save(any(TeamInvitation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        teamInvitationService.invite("owner@example.com", request);

        assertFalse(activeInvitation.isActive());
        verify(invitationRepository, times(2)).save(any(TeamInvitation.class));
    }
}
