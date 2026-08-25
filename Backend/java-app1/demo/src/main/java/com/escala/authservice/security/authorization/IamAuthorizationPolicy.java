package com.escala.authservice.security.authorization;

import com.escala.authservice.entity.Role;
import com.escala.authservice.entity.User;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.util.Objects;

/**
 * Resource-level authorization policy for user and role administration.
 *
 * <p>The caller identity is resolved by the application service. This policy
 * combines role, tenant and target-resource checks and deliberately keeps the
 * decision out of controllers and request data.</p>
 */
@Component
public class IamAuthorizationPolicy {

    public void requireCanListUsers(User actor) {
        if (!isOwnerOrAdmin(actor)) {
            throw denied();
        }
    }

    public void requireCanAdministerUsers(User actor) {
        requireCanListUsers(actor);
    }

    public void requireCanManageRole(User actor, User target, String roleName) {
        if (!isOwnerOrAdmin(actor)) {
            throw denied();
        }
        requireSameTenantOrSystemAdmin(actor, target);
        if (hasRole(target, "SYSTEM_ADMIN") && !isSystemAdmin(actor)) {
            throw denied();
        }
        if ("SYSTEM_ADMIN".equalsIgnoreCase(roleName) && !isSystemAdmin(actor)) {
            throw denied();
        }
        if (("OWNER".equalsIgnoreCase(roleName) || "ADMIN".equalsIgnoreCase(roleName)) && !isOwner(actor)) {
            throw denied();
        }
    }

    public void requireCanUpdateUser(User actor, User target) {
        requireSameTenantOrSystemAdmin(actor, target);
        if (!Objects.equals(actor.getId(), target.getId()) && !isOwnerOrAdmin(actor)) {
            throw denied();
        }
        if (hasRole(target, "SYSTEM_ADMIN") && !isSystemAdmin(actor)) {
            throw denied();
        }
    }

    public boolean isSystemAdmin(User user) {
        return hasRole(user, "SYSTEM_ADMIN");
    }

    private boolean isOwnerOrAdmin(User user) {
        return isSystemAdmin(user) || hasRole(user, "OWNER") || hasRole(user, "ADMIN");
    }

    private boolean isOwner(User user) {
        return isSystemAdmin(user) || hasRole(user, "OWNER");
    }

    private void requireSameTenantOrSystemAdmin(User actor, User target) {
        if (isSystemAdmin(actor)) {
            return;
        }
        if (actor == null || target == null || actor.getCompany() == null || target.getCompany() == null
                || !Objects.equals(actor.getCompany().getId(), target.getCompany().getId())) {
            throw denied();
        }
    }

    private boolean hasRole(User user, String roleName) {
        if (user == null || user.getRoles() == null) {
            return false;
        }
        return user.getRoles().stream()
                .map(Role::getName)
                .anyMatch(roleName::equalsIgnoreCase);
    }

    private AccessDeniedException denied() {
        // A generic response avoids disclosing whether a cross-tenant resource exists.
        return new AccessDeniedException("Operacao nao autorizada para este recurso");
    }
}
