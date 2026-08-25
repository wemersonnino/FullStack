package com.escala.authservice.service;

import com.escala.authservice.dto.RoleChangeRequest;
import com.escala.authservice.dto.ChangePasswordRequest;
import com.escala.authservice.dto.UpdateCurrentUserRequest;
import com.escala.authservice.entity.Role;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.RoleRepository;
import com.escala.authservice.repository.UserRepository;
import com.escala.authservice.security.authorization.IamAuthorizationPolicy;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserManagementService {
    private static final Set<String> ALLOWED_THEMES = Set.of("light", "dark", "system");
    private static final Set<String> MANAGEABLE_ROLES = Set.of("USER", "MANAGER", "ADMIN", "OWNER");

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final CurrentUserService currentUserService;
    private final IamAuthorizationPolicy authorizationPolicy;
    private final AuditLogService auditLogService;

    public org.springframework.data.domain.Page<User> list(String requesterEmail, org.springframework.data.domain.Pageable pageable) {
        User requester = currentUser(requesterEmail);
        authorizationPolicy.requireCanListUsers(requester);
        if (authorizationPolicy.isSystemAdmin(requester)) {
            auditGlobalAccess(requester, "LIST_USERS", null);
            return userRepository.findAll(pageable);
        }
        return userRepository.findByCompanyId(requester.getCompany().getId(), pageable);
    }

    public User currentUser(String email) {
        return currentUserService.requireCurrentUser(email);
    }

    public User updateCurrentUser(String currentEmail, UpdateCurrentUserRequest request) {
        User user = currentUser(currentEmail);

        String username = request.getUsername() == null ? "" : request.getUsername().trim();
        String email = request.getEmail() == null ? "" : request.getEmail().trim().toLowerCase();

        if (username.isBlank() || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username and email are required");
        }
        if (userRepository.existsByCompanyIdAndUsernameIgnoreCaseAndIdNot(user.getCompany().getId(), username, user.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username already exists in this company");
        }
        if (userRepository.existsByEmailIgnoreCaseAndIdNot(email, user.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }

        user.setUsername(username);
        user.setEmail(email);

        String theme = request.getTheme();
        if (theme != null && !theme.isBlank()) {
            user.setTheme(normalizeTheme(theme));
        }

        if (request.getAvatarUrl() != null) {
            String avatarUrl = request.getAvatarUrl().trim();
            if (avatarUrl.isBlank()) {
                user.setAvatarUrl(null);
            } else if (!isAllowedAvatarUrl(avatarUrl)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Avatar URL is not allowed");
            } else {
                user.setAvatarUrl(avatarUrl);
            }
        }

        user.setAddress(request.getAddress());
        user.setCep(request.getCep());
        user.setStreet(request.getStreet());
        user.setNumber(request.getNumber());
        user.setComplement(request.getComplement());
        user.setNeighborhood(request.getNeighborhood());
        user.setCity(request.getCity());
        user.setState(request.getState());
        user.setPosition(request.getPosition());
        user.setFunction(request.getFunction());

        return userRepository.save(user);
    }

    public void changeCurrentUserPassword(String currentEmail, ChangePasswordRequest request) {
        User user = currentUser(currentEmail);

        if (request.getCurrentPassword() == null || request.getNewPassword() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current and new password are required");
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is invalid");
        }

        if (request.getNewPassword().length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must have at least 8 characters");
        }
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must be different from current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private boolean hasRole(User user, String roleName) {
        if (user == null || user.getRoles() == null) return false;
        return user.getRoles().stream().anyMatch(r -> r.getName().equalsIgnoreCase(roleName));
    }

    @Transactional
    public User grantRole(String requesterEmail, UUID userId, RoleChangeRequest request) {
        User requester = currentUser(requesterEmail);
        User user = roleTarget(requester, userId);
        String roleName = normalizeRole(request.getRoleName());
        
        authorizationPolicy.requireCanManageRole(requester, user, roleName);

        if (!MANAGEABLE_ROLES.contains(roleName)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role not allowed");
        }

        Role role = roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(Role.builder().name(roleName).build()));
        user.getRoles().add(role);
        User saved = userRepository.save(user);
        auditGlobalAccess(requester, "GRANT_ROLE", user);
        return saved;
    }

    @Transactional
    public User revokeRole(String requesterEmail, UUID userId, RoleChangeRequest request) {
        User requester = currentUser(requesterEmail);
        User user = roleTarget(requester, userId);
        String roleName = normalizeRole(request.getRoleName());
        
        authorizationPolicy.requireCanManageRole(requester, user, roleName);

        if (!MANAGEABLE_ROLES.contains(roleName)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role not allowed");
        }
        if ("OWNER".equals(roleName) && isLastOwnerInCompany(user)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A empresa precisa manter ao menos um OWNER ativo");
        }

        user.getRoles().removeIf(role -> role.getName().equals(roleName));
        User saved = userRepository.save(user);
        auditGlobalAccess(requester, "REVOKE_ROLE", user);
        return saved;
    }

    @Transactional
    public User updateTheme(String requesterEmail, UUID userId, String theme) {
        User requester = currentUser(requesterEmail);
        User user;
        if (requester.getId().equals(userId)) {
            user = requester;
        } else {
            authorizationPolicy.requireCanAdministerUsers(requester);
            user = targetInAuthorizedScope(requester, userId);
        }
        
        authorizationPolicy.requireCanUpdateUser(requester, user);

        user.setTheme(normalizeTheme(theme));
        User saved = userRepository.save(user);
        auditGlobalAccess(requester, "UPDATE_USER_THEME", user);
        return saved;
    }

    private String normalizeRole(String roleName) {
        if (roleName == null || roleName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role name is required");
        }
        return roleName.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizeTheme(String theme) {
        String normalized = theme == null ? "system" : theme.trim().toLowerCase(Locale.ROOT);
        if (!ALLOWED_THEMES.contains(normalized)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Theme must be light, dark or system");
        }
        return normalized;
    }

    private boolean isAllowedAvatarUrl(String avatarUrl) {
        if (avatarUrl.startsWith("/api/bff/avatar/files/")) {
            return true;
        }

        try {
            URI uri = new URI(avatarUrl);
            String scheme = uri.getScheme();
            String host = uri.getHost();
            return "https".equalsIgnoreCase(scheme)
                    && host != null
                    && (host.equalsIgnoreCase("lh3.googleusercontent.com")
                    || host.endsWith(".googleusercontent.com"));
        } catch (URISyntaxException exception) {
            return false;
        }
    }

    private boolean isLastOwnerInCompany(User user) {
        if (user.getCompany() == null) {
            return false;
        }
        long ownerCount = userRepository.findByCompanyId(user.getCompany().getId()).stream()
                .filter(candidate -> hasRole(candidate, "OWNER"))
                .count();
        return ownerCount <= 1 && hasRole(user, "OWNER");
    }

    private User roleTarget(User actor, UUID userId) {
        authorizationPolicy.requireCanAdministerUsers(actor);
        return targetInAuthorizedScope(actor, userId);
    }

    private User targetInAuthorizedScope(User actor, UUID userId) {
        if (authorizationPolicy.isSystemAdmin(actor)) {
            return userRepository.findById(userId)
                    .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("Operacao nao autorizada para este recurso"));
        }
        if (actor.getCompany() == null) {
            throw new org.springframework.security.access.AccessDeniedException("Operacao nao autorizada para este recurso");
        }
        return userRepository.findByIdAndCompanyId(userId, actor.getCompany().getId())
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("Operacao nao autorizada para este recurso"));
    }

    private void auditGlobalAccess(User actor, String action, User target) {
        if (!authorizationPolicy.isSystemAdmin(actor)) {
            return;
        }
        String targetTenant = target != null && target.getCompany() != null
                ? String.valueOf(target.getCompany().getId())
                : "all";
        auditLogService.record(actor.getEmail(), action, "User", target == null ? null : target.getId(),
                "Privileged SYSTEM_ADMIN access; targetTenant=" + targetTenant);
    }
}
