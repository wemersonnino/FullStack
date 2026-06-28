package com.escala.authservice.core.company.domain;

import lombok.Builder;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class CompanyDomain {
    private UUID id;
    private String name;
    private String slug;
    private String cnpj;
    private boolean active;
    private String planType;
    private OffsetDateTime trialExpiresAt;
    private Double latitude;
    private Double longitude;
}
