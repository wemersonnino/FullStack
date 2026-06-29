package com.escala.authservice.service;

import com.escala.authservice.entity.Role;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.RoleRepository;
import com.escala.authservice.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertSame;
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
    private PolicyService policyService;

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
        when(policyService.isSystemAdmin(requester)).thenReturn(true);
        when(userRepository.findAll(pageable)).thenReturn(expected);

        Page<User> result = userManagementService.list("root@example.com", pageable);

        assertSame(expected, result);
        verify(userRepository).findAll(pageable);
    }
}
