package com.escala.authservice.controller;

import com.escala.authservice.dto.ChangePasswordRequest;
import com.escala.authservice.dto.RoleChangeRequest;
import com.escala.authservice.dto.UpdateCurrentUserRequest;
import com.escala.authservice.dto.UserResponse;
import com.escala.authservice.service.UserManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserManagementController {
    private final UserManagementService userManagementService;

    @GetMapping
    public List<UserResponse> list(Authentication authentication) {
        return userManagementService.list(authentication.getName()).stream().map(UserResponse::from).toList();
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(Authentication authentication) {
        return ResponseEntity.ok(UserResponse.from(userManagementService.currentUser(authentication.getName())));
    }

    @PatchMapping("/me")
    public ResponseEntity<UserResponse> updateMe(
            Authentication authentication,
            @RequestBody UpdateCurrentUserRequest request
    ) {
        return ResponseEntity.ok(UserResponse.from(userManagementService.updateCurrentUser(authentication.getName(), request)));
    }

    @PatchMapping("/me/password")
    public ResponseEntity<Map<String, String>> changeMyPassword(
            Authentication authentication,
            @RequestBody ChangePasswordRequest request
    ) {
        userManagementService.changeCurrentUserPassword(authentication.getName(), request);
        return ResponseEntity.ok(Map.of("message", "Password updated"));
    }

    @PostMapping("/{id}/roles")
    public ResponseEntity<UserResponse> grantRole(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody RoleChangeRequest request
    ) {
        return ResponseEntity.ok(UserResponse.from(userManagementService.grantRole(authentication.getName(), id, request)));
    }

    @DeleteMapping("/{id}/roles")
    public ResponseEntity<UserResponse> revokeRole(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody RoleChangeRequest request
    ) {
        return ResponseEntity.ok(UserResponse.from(userManagementService.revokeRole(authentication.getName(), id, request)));
    }

    @PatchMapping("/{id}/theme")
    public ResponseEntity<UserResponse> updateTheme(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        return ResponseEntity.ok(UserResponse.from(userManagementService.updateTheme(authentication.getName(), id, body.getOrDefault("theme", "system"))));
    }
}
