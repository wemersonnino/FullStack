package com.escala.authservice.security.authorization;

import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.Role;
import com.escala.authservice.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;

import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class IamAuthorizationPolicyTest {
    private final IamAuthorizationPolicy policy = new IamAuthorizationPolicy();

    @Test
    void authenticatedUserWithoutAdministrativeRoleCannotListUsers() {
        assertThrows(AccessDeniedException.class, () -> policy.requireCanListUsers(user(company(), "USER")));
    }

    @Test
    void adminCanManageOrdinaryRoleInsideOwnTenant() {
        Company company = company();
        assertDoesNotThrow(() -> policy.requireCanManageRole(user(company, "ADMIN"), user(company, "USER"), "MANAGER"));
    }

    @Test
    void validAdminRoleDoesNotBypassTargetTenant() {
        assertThrows(AccessDeniedException.class,
                () -> policy.requireCanManageRole(user(company(), "ADMIN"), user(company(), "USER"), "MANAGER"));
    }

    @Test
    void adminCannotGrantOwnerRole() {
        Company company = company();
        assertThrows(AccessDeniedException.class,
                () -> policy.requireCanManageRole(user(company, "ADMIN"), user(company, "USER"), "OWNER"));
    }

    @Test
    void ordinaryUserCanUpdateSelfButNotAnotherUser() {
        Company company = company();
        User actor = user(company, "USER");
        assertDoesNotThrow(() -> policy.requireCanUpdateUser(actor, actor));
        assertThrows(AccessDeniedException.class, () -> policy.requireCanUpdateUser(actor, user(company, "USER")));
    }

    @Test
    void systemAdminGlobalAccessIsExplicit() {
        assertDoesNotThrow(() -> policy.requireCanManageRole(
                user(company(), "SYSTEM_ADMIN"), user(company(), "USER"), "MANAGER"));
    }

    @Test
    void nonSystemAdminCannotOperateSystemAdminTarget() {
        Company company = company();
        assertThrows(AccessDeniedException.class,
                () -> policy.requireCanUpdateUser(user(company, "OWNER"), user(company, "SYSTEM_ADMIN")));
    }

    private Company company() {
        return Company.builder().id(UUID.randomUUID()).slug(UUID.randomUUID().toString()).build();
    }

    private User user(Company company, String role) {
        return User.builder()
                .id(UUID.randomUUID())
                .email(UUID.randomUUID() + "@example.test")
                .company(company)
                .roles(Set.of(Role.builder().name(role).build()))
                .build();
    }
}
