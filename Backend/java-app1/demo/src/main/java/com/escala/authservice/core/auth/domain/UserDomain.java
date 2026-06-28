package com.escala.authservice.core.auth.domain;

import lombok.Builder;
import lombok.Data;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
public class UserDomain {
    private UUID id;
    private String username;
    private String email;
    private String password;
    private Set<String> roles;
    private boolean active;
    private UUID companyId;
    private String companySlug;
}
