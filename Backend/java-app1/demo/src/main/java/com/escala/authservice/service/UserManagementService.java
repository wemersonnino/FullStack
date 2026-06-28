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
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserManagementService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public org.springframework.data.domain.Page<User> list(String requesterEmail, org.springframework.data.domain.Pageable pageable) {
        User requester = currentUser(requesterEmail);
        return userRepository.findByCompanyId(requester.getCompany().getId(), pageable);
    }

    public User currentUser(String email) {
        return userRepository.findByEmail(email).orElseThrow();
    }

    public User updateCurrentUser(String currentEmail, UpdateCurrentUserRequest request) {
        User user = currentUser(currentEmail);

        String username = request.getUsername() == null ? "" : request.getUsername().trim();
        String email = request.getEmail() == null ? "" : request.getEmail().trim().toLowerCase();

        if (username.isBlank() || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username and email are required");
        }

        user.setUsername(username);
        user.setEmail(email);

        String theme = request.getTheme();
        if (theme != null && !theme.isBlank()) {
            user.setTheme(theme);
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

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public User grantRole(String requesterEmail, UUID userId, RoleChangeRequest request) {
        User requester = currentUser(requesterEmail);
        User user = userRepository.findById(userId).orElseThrow();
        
        if (user.getCompany() == null || !user.getCompany().getId().equals(requester.getCompany().getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Nao autorizado a alterar roles de usuario de outra empresa");
        }

        Role role = roleRepository.findByName(request.getRoleName())
                .orElseGet(() -> roleRepository.save(Role.builder().name(request.getRoleName()).build()));
        user.getRoles().add(role);
        return userRepository.save(user);
    }

    public User revokeRole(String requesterEmail, UUID userId, RoleChangeRequest request) {
        User requester = currentUser(requesterEmail);
        User user = userRepository.findById(userId).orElseThrow();
        
        if (user.getCompany() == null || !user.getCompany().getId().equals(requester.getCompany().getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Nao autorizado a alterar roles de usuario de outra empresa");
        }

        user.getRoles().removeIf(role -> role.getName().equals(request.getRoleName()));
        return userRepository.save(user);
    }

    public User updateTheme(String requesterEmail, UUID userId, String theme) {
        User requester = currentUser(requesterEmail);
        User user = userRepository.findById(userId).orElseThrow();
        
        if (user.getCompany() == null || !user.getCompany().getId().equals(requester.getCompany().getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Nao autorizado a alterar tema de usuario de outra empresa");
        }

        user.setTheme(theme);
        return userRepository.save(user);
    }
}
