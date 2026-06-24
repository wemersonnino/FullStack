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
    private String address;
    private String cep;
    private String street;
    private String number;
    private String complement;
    private String neighborhood;
    private String city;
    private String state;
    private String position;
    private String function;
    private boolean active;
    private Long companyId;
    private String companyName;
    private String companySlug;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                .theme(user.getTheme() == null ? "system" : user.getTheme())
                .avatarUrl(user.getAvatarUrl())
                .address(user.getAddress())
                .cep(user.getCep())
                .street(user.getStreet())
                .number(user.getNumber())
                .complement(user.getComplement())
                .neighborhood(user.getNeighborhood())
                .city(user.getCity())
                .state(user.getState())
                .position(user.getPosition())
                .function(user.getFunction())
                .active(user.isActive())
                .companyId(user.getCompany() == null ? null : user.getCompany().getId())
                .companyName(user.getCompany() == null ? null : user.getCompany().getName())
                .companySlug(user.getCompany() == null ? null : user.getCompany().getSlug())
                .build();
    }
}
