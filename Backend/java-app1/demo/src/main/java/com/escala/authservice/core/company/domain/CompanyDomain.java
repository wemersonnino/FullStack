package com.escala.authservice.core.company.domain;

import lombok.Builder;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
@Builder
public class CompanyDomain {
    private Long id;
    private String name;
    private String slug;
    private String cnpj;
    private boolean active;
    private String planType;
    private OffsetDateTime trialExpiresAt;
    private Double latitude;
    private Double longitude;
}
