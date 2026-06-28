package com.escala.authservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeadCaptureResponse {
    private UUID id;
    private String email;
    private String name;
    private OffsetDateTime createdAt;
    private boolean marketingConsentGranted;
    private boolean personalEmail;
    private String recommendedPlan;
    private String recommendedTemplate;
    private boolean converted;
    private String message;
}
