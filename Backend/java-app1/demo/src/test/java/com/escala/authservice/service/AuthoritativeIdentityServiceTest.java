package com.escala.authservice.service;

import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.Role;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AuthoritativeIdentityServiceTest {

    private final UserRepository userRepository = mock(UserRepository.class);
    private final AuthoritativeIdentityService service = new AuthoritativeIdentityService(userRepository);

    @Test
    void rejectsDisabledUsersEvenWhenTheirJwtWouldStillBeValid() {
        UUID userId = UUID.randomUUID();
        User user = user(userId, true, false, Set.of("ADMIN"));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        assertFalse(service.resolveActiveIdentity(userId).isPresent());
    }

    @Test
    void usesCurrentTenantAndRolesInsteadOfJwtClaims() {
        UUID userId = UUID.randomUUID();
        User user = user(userId, true, true, Set.of("USER"));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        var identity = service.resolveActiveIdentity(userId);

        assertTrue(identity.isPresent());
        assertEquals(user.getCompany().getId(), identity.orElseThrow().companyId());
        assertEquals(Set.of("USER"), identity.orElseThrow().roles());
    }

    private User user(UUID userId, boolean companyActive, boolean userActive, Set<String> roleNames) {
        Company company = Company.builder()
                .id(UUID.randomUUID())
                .slug("tenant-current")
                .active(companyActive)
                .build();
        Set<Role> roles = roleNames.stream().map(name -> Role.builder().name(name).build()).collect(java.util.stream.Collectors.toSet());
        return User.builder()
                .id(userId)
                .email("user@example.com")
                .password("encoded")
                .company(company)
                .roles(roles)
                .active(userActive)
                .build();
    }
}
