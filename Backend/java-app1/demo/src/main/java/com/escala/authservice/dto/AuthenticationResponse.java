package com.escala.authservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Set;
import java.util.UUID;
import java.time.OffsetDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationResponse {
    private String token;
    private UserDto user;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserDto {
        private UUID id;
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
        private UUID companyId;
        private String companySlug;
        private String companyName;
        private String companyTheme;
        private String planType;
        private OffsetDateTime trialExpiresAt;
    }
}
