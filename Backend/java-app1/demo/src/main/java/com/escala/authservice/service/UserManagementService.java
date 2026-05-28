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

@Service
@RequiredArgsConstructor
public class UserManagementService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public List<User> list() {
        return userRepository.findAll();
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

    public User grantRole(Long userId, RoleChangeRequest request) {
        User user = userRepository.findById(userId).orElseThrow();
        Role role = roleRepository.findByName(request.getRoleName())
                .orElseGet(() -> roleRepository.save(Role.builder().name(request.getRoleName()).build()));
        user.getRoles().add(role);
        return userRepository.save(user);
    }

    public User revokeRole(Long userId, RoleChangeRequest request) {
        User user = userRepository.findById(userId).orElseThrow();
        user.getRoles().removeIf(role -> role.getName().equals(request.getRoleName()));
        return userRepository.save(user);
    }

    public User updateTheme(Long userId, String theme) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setTheme(theme);
        return userRepository.save(user);
    }
}
