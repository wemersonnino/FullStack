package com.escala.authservice.core.auth.domain;

import lombok.Builder;
import lombok.Data;
import java.util.Set;

@Data
@Builder
public class UserDomain {
    private Long id;
    private String username;
    private String email;
    private String password;
    private Set<String> roles;
    private boolean active;
    private Long companyId;
    private String companySlug;
}
