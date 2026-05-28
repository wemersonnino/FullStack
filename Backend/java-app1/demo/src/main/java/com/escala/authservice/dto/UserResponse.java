package com.escala.authservice.dto;

import com.escala.authservice.entity.Role;
import com.escala.authservice.entity.User;
import lombok.Builder;
import lombok.Data;

import java.util.Set;
import java.util.stream.Collectors;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private Set<String> roles;
    private String theme;
    private String avatarUrl;
    private boolean active;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                .theme(user.getTheme() == null ? "system" : user.getTheme())
                .avatarUrl(user.getAvatarUrl())
                .active(user.isActive())
                .build();
    }
}
