package com.escala.authservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeadCaptureRequest {
    private String name;
    private String email;
    private String phone;
    private String companyName;
    private String employeeRange;
    private String companySegment;
    private Boolean marketingConsentGranted;
    private String consentVersion;
    private String source;
    private String utmSource;
    private String utmMedium;
    private String utmCampaign;
    private String utmContent;
    private String utmTerm;
    private String referrer;
    private String landingPageSlug;
    private String campaignSlug;
    private OffsetDateTime capturedAt;
}
