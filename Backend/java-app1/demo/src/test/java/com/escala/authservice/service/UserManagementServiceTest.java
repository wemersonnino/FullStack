package com.escala.authservice.service;

import com.escala.authservice.dto.UpdateCurrentUserRequest;
import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.Role;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.RoleRepository;
import com.escala.authservice.repository.UserRepository;
import com.escala.authservice.security.authorization.IamAuthorizationPolicy;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserManagementServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private CurrentUserService currentUserService;

    @Mock
    private IamAuthorizationPolicy authorizationPolicy;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private UserManagementService userManagementService;

    @Test
    void listAllowsSystemAdminToSeeAllUsers() {
        User requester = User.builder()
                .id(UUID.randomUUID())
                .email("root@example.com")
                .roles(Set.of(Role.builder().name("SYSTEM_ADMIN").build()))
                .build();
        PageRequest pageable = PageRequest.of(0, 20);
        Page<User> expected = new PageImpl<>(List.of(
                User.builder().id(UUID.randomUUID()).email("a@example.com").build(),
                User.builder().id(UUID.randomUUID()).email("b@example.com").build()
        ));

        when(currentUserService.requireCurrentUser("root@example.com")).thenReturn(requester);
        when(authorizationPolicy.isSystemAdmin(requester)).thenReturn(true);
        when(userRepository.findAll(pageable)).thenReturn(expected);

        Page<User> result = userManagementService.list("root@example.com", pageable);

        assertSame(expected, result);
        verify(userRepository).findAll(pageable);
    }

    @Test
    void updateCurrentUserRejectsUntrustedAvatarUrl() {
        Company company = Company.builder().id(UUID.randomUUID()).name("Empresa").slug("empresa").build();
        User user = User.builder()
                .id(UUID.randomUUID())
                .email("admin@example.com")
                .username("admin")
                .company(company)
                .build();
        UpdateCurrentUserRequest request = new UpdateCurrentUserRequest();
        request.setUsername("admin");
        request.setEmail("admin@example.com");
        request.setAvatarUrl("https://evil.example.com/avatar.png");

        when(currentUserService.requireCurrentUser("admin@example.com")).thenReturn(user);
        when(userRepository.existsByCompanyIdAndUsernameIgnoreCaseAndIdNot(company.getId(), "admin", user.getId())).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCaseAndIdNot("admin@example.com", user.getId())).thenReturn(false);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> userManagementService.updateCurrentUser("admin@example.com", request)
        );

        assertEquals("Avatar URL is not allowed", exception.getReason());
    }

    @Test
    void updateCurrentUserAcceptsProtectedAvatarRoute() {
        Company company = Company.builder().id(UUID.randomUUID()).name("Empresa").slug("empresa").build();
        User user = User.builder()
                .id(UUID.randomUUID())
                .email("admin@example.com")
                .username("admin")
                .company(company)
                .build();
        UpdateCurrentUserRequest request = new UpdateCurrentUserRequest();
        request.setUsername("admin");
        request.setEmail("admin@example.com");
        request.setAvatarUrl("/api/bff/avatar/files/abc-123.webp");

        when(currentUserService.requireCurrentUser("admin@example.com")).thenReturn(user);
        when(userRepository.existsByCompanyIdAndUsernameIgnoreCaseAndIdNot(company.getId(), "admin", user.getId())).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCaseAndIdNot("admin@example.com", user.getId())).thenReturn(false);
        when(userRepository.save(user)).thenReturn(user);

        User result = userManagementService.updateCurrentUser("admin@example.com", request);

        assertSame(user, result);
        assertEquals("/api/bff/avatar/files/abc-123.webp", user.getAvatarUrl());
        verify(userRepository).save(user);
    }

    @Test
    void updateThemeDoesNotLoadUserFromAnotherTenant() {
        Company company = Company.builder().id(UUID.randomUUID()).name("Empresa").slug("empresa").build();
        User admin = User.builder().id(UUID.randomUUID()).email("admin@example.com").company(company).build();
        UUID foreignUserId = UUID.randomUUID();

        when(currentUserService.requireCurrentUser("admin@example.com")).thenReturn(admin);
        when(userRepository.findByIdAndCompanyId(foreignUserId, company.getId())).thenReturn(java.util.Optional.empty());

        assertThrows(AccessDeniedException.class,
                () -> userManagementService.updateTheme("admin@example.com", foreignUserId, "dark"));

        verify(userRepository).findByIdAndCompanyId(foreignUserId, company.getId());
    }
}
