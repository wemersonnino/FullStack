package com.escala.authservice.service;

import com.escala.authservice.dto.RoleChangeRequest;
import com.escala.authservice.dto.ChangePasswordRequest;
import com.escala.authservice.dto.UpdateCurrentUserRequest;
import com.escala.authservice.entity.Role;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.RoleRepository;
import com.escala.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

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
    private final PolicyService policyService;

    public org.springframework.data.domain.Page<User> list(String requesterEmail, org.springframework.data.domain.Pageable pageable) {
        User requester = currentUser(requesterEmail);
        policyService.requireOwnerOrAdmin(requester, "Apenas administradores ou donos podem listar usuarios");
        if (policyService.isSystemAdmin(requester)) {
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
            user.setAvatarUrl(avatarUrl.isBlank() ? null : avatarUrl);
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

    public User grantRole(String requesterEmail, UUID userId, RoleChangeRequest request) {
        User requester = currentUser(requesterEmail);
        User user = userRepository.findById(userId).orElseThrow();
        String roleName = normalizeRole(request.getRoleName());
        
        boolean requesterIsSystemAdmin = hasRole(requester, "SYSTEM_ADMIN");
        boolean requesterIsAdminOrOwner = requesterIsSystemAdmin || hasRole(requester, "ADMIN") || hasRole(requester, "OWNER");
        
        if (!requesterIsAdminOrOwner) {
            throw new org.springframework.security.access.AccessDeniedException("Apenas administradores ou donos podem gerenciar papeis de usuarios");
        }

        if (!requesterIsSystemAdmin && (user.getCompany() == null || !user.getCompany().getId().equals(requester.getCompany().getId()))) {
            throw new org.springframework.security.access.AccessDeniedException("Nao autorizado a alterar roles de usuario de outra empresa");
        }

        boolean targetIsSystemAdmin = hasRole(user, "SYSTEM_ADMIN");
        if (targetIsSystemAdmin && !requesterIsSystemAdmin) {
            throw new org.springframework.security.access.AccessDeniedException("Apenas administradores do sistema podem alterar roles de um SYSTEM_ADMIN");
        }

        if (!MANAGEABLE_ROLES.contains(roleName)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role not allowed");
        }
        if ("SYSTEM_ADMIN".equalsIgnoreCase(roleName) && !requesterIsSystemAdmin) {
            throw new org.springframework.security.access.AccessDeniedException("Nao e permitido gerenciar o papel de SYSTEM_ADMIN via API");
        }
        if (("OWNER".equals(roleName) || "ADMIN".equals(roleName)) && !policyService.isOwner(requester)) {
            throw new org.springframework.security.access.AccessDeniedException("Apenas owners podem conceder OWNER ou ADMIN");
        }

        Role role = roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(Role.builder().name(roleName).build()));
        user.getRoles().add(role);
        return userRepository.save(user);
    }

    public User revokeRole(String requesterEmail, UUID userId, RoleChangeRequest request) {
        User requester = currentUser(requesterEmail);
        User user = userRepository.findById(userId).orElseThrow();
        String roleName = normalizeRole(request.getRoleName());
        
        boolean requesterIsSystemAdmin = hasRole(requester, "SYSTEM_ADMIN");
        boolean requesterIsAdminOrOwner = requesterIsSystemAdmin || hasRole(requester, "ADMIN") || hasRole(requester, "OWNER");
        
        if (!requesterIsAdminOrOwner) {
            throw new org.springframework.security.access.AccessDeniedException("Apenas administradores ou donos podem gerenciar papeis de usuarios");
        }

        if (!requesterIsSystemAdmin && (user.getCompany() == null || !user.getCompany().getId().equals(requester.getCompany().getId()))) {
            throw new org.springframework.security.access.AccessDeniedException("Nao autorizado a alterar roles de usuario de outra empresa");
        }

        boolean targetIsSystemAdmin = hasRole(user, "SYSTEM_ADMIN");
        if (targetIsSystemAdmin && !requesterIsSystemAdmin) {
            throw new org.springframework.security.access.AccessDeniedException("Apenas administradores do sistema podem revogar roles de um SYSTEM_ADMIN");
        }

        if (!MANAGEABLE_ROLES.contains(roleName)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role not allowed");
        }
        if ("SYSTEM_ADMIN".equalsIgnoreCase(roleName) && !requesterIsSystemAdmin) {
            throw new org.springframework.security.access.AccessDeniedException("Nao e permitido gerenciar o papel de SYSTEM_ADMIN via API");
        }
        if (("OWNER".equals(roleName) || "ADMIN".equals(roleName)) && !policyService.isOwner(requester)) {
            throw new org.springframework.security.access.AccessDeniedException("Apenas owners podem revogar OWNER ou ADMIN");
        }
        if ("OWNER".equals(roleName) && isLastOwnerInCompany(user)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A empresa precisa manter ao menos um OWNER ativo");
        }

        user.getRoles().removeIf(role -> role.getName().equals(roleName));
        return userRepository.save(user);
    }

    public User updateTheme(String requesterEmail, UUID userId, String theme) {
        User requester = currentUser(requesterEmail);
        User user = userRepository.findById(userId).orElseThrow();
        
        boolean requesterIsSystemAdmin = hasRole(requester, "SYSTEM_ADMIN");
        if (!requesterIsSystemAdmin && (user.getCompany() == null || !user.getCompany().getId().equals(requester.getCompany().getId()))) {
            throw new org.springframework.security.access.AccessDeniedException("Nao autorizado a alterar tema de usuario de outra empresa");
        }

        boolean isSelf = user.getId().equals(requester.getId());
        boolean requesterIsAdminOrOwner = requesterIsSystemAdmin || hasRole(requester, "ADMIN") || hasRole(requester, "OWNER");
        
        if (!isSelf && !requesterIsAdminOrOwner) {
            throw new org.springframework.security.access.AccessDeniedException("Nao autorizado a alterar o tema de outro usuario");
        }

        boolean targetIsSystemAdmin = hasRole(user, "SYSTEM_ADMIN");
        if (targetIsSystemAdmin && !requesterIsSystemAdmin) {
            throw new org.springframework.security.access.AccessDeniedException("Apenas administradores do sistema podem alterar dados de um SYSTEM_ADMIN");
        }

        user.setTheme(normalizeTheme(theme));
        return userRepository.save(user);
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

    private boolean isLastOwnerInCompany(User user) {
        if (user.getCompany() == null) {
            return false;
        }
        long ownerCount = userRepository.findByCompanyId(user.getCompany().getId()).stream()
                .filter(candidate -> hasRole(candidate, "OWNER"))
                .count();
        return ownerCount <= 1 && hasRole(user, "OWNER");
    }
}
