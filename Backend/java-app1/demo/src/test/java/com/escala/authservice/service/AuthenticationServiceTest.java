package com.escala.authservice.service;

import com.escala.authservice.dto.GoogleLoginRequest;
import com.escala.authservice.dto.RegisterRequest;
import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.TeamInvitation;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.MarketingLeadRepository;
import com.escala.authservice.repository.PasswordResetTokenRepository;
import com.escala.authservice.repository.RoleRepository;
import com.escala.authservice.repository.TeamInvitationRepository;
import com.escala.authservice.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private CompanyService companyService;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private RecaptchaService recaptchaService;

    @Mock
    private GoogleIdentityService googleIdentityService;

    @Mock
    private com.escala.authservice.core.auth.port.in.AuthenticationUseCase authenticationUseCase;

    @Mock
    private TeamInvitationRepository teamInvitationRepository;

    @Mock
    private CurrentUserService currentUserService;

    @Mock
    private MarketingLeadRepository marketingLeadRepository;

    @Mock
    private SensitiveTokenService sensitiveTokenService;

    @InjectMocks
    private AuthenticationService authenticationService;

    @Test
    void registerRejectsDuplicatedEmailInsideTenant() {
        Company company = Company.builder().id(UUID.randomUUID()).slug("empresa-a").name("Empresa A").build();
        TeamInvitation invitation = TeamInvitation.builder()
                .email("owner@example.com")
                .company(company)
                .active(true)
                .expiresAt(java.time.OffsetDateTime.now().plusDays(2))
                .build();
        RegisterRequest request = RegisterRequest.builder()
                .username("owner")
                .email("OWNER@example.com")
                .password("12345678")
                .companySlug("empresa-a")
                .build();

        when(companyService.resolve("empresa-a")).thenReturn(company);
        when(teamInvitationRepository.findByEmailIgnoreCaseAndCompanyId("owner@example.com", company.getId()))
                .thenReturn(Optional.of(invitation));
        when(userRepository.existsByCompanyIdAndEmailIgnoreCase(company.getId(), "owner@example.com")).thenReturn(true);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> authenticationService.register(request)
        );

        assertEquals("Este email ja pertence a um usuario desta empresa", exception.getMessage());
    }

    @Test
    void authenticateGoogleRequiresInvitationWhenEmailExistsInAnotherTenant() {
        Company companyA = Company.builder().id(UUID.randomUUID()).slug("empresa-a").name("Empresa A").build();
        Company companyB = Company.builder().id(UUID.randomUUID()).slug("empresa-b").name("Empresa B").build();
        User existingUser = User.builder()
                .id(UUID.randomUUID())
                .email("user@example.com")
                .company(companyA)
                .active(true)
                .build();
        GoogleLoginRequest request = new GoogleLoginRequest();
        request.setIdToken("token-google");
        request.setCompanySlug("empresa-b");

        when(googleIdentityService.verify("token-google"))
                .thenReturn(new GoogleIdentityService.GoogleProfile("user@example.com", "User", "sub-1", null));
        when(userRepository.findAllByEmailIgnoreCase("user@example.com")).thenReturn(java.util.List.of(existingUser));
        when(companyService.resolve("empresa-b")).thenReturn(companyB);
        when(teamInvitationRepository.findByEmailIgnoreCaseAndCompanyId("user@example.com", companyB.getId()))
                .thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> authenticationService.authenticateGoogle(request)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertEquals("Nao ha nenhum convite ativo para este e-mail nesta empresa", exception.getReason());
    }

    @Test
    void authenticateGoogleRequiresInvitationForExistingCompanyWhenUserDoesNotExist() {
        Company company = Company.builder().id(UUID.randomUUID()).slug("empresa-b").name("Empresa B").build();
        GoogleLoginRequest request = new GoogleLoginRequest();
        request.setIdToken("token-google");
        request.setCompanySlug("empresa-b");

        when(googleIdentityService.verify("token-google"))
                .thenReturn(new GoogleIdentityService.GoogleProfile("user@example.com", "User", "sub-1", null));
        when(userRepository.findAllByEmailIgnoreCase("user@example.com")).thenReturn(java.util.List.of());
        when(companyService.resolve("empresa-b")).thenReturn(company);
        when(teamInvitationRepository.findByEmailIgnoreCaseAndCompanyId("user@example.com", company.getId())).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> authenticationService.authenticateGoogle(request)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertEquals("Nao ha nenhum convite ativo para este e-mail nesta empresa", exception.getReason());
    }
}
