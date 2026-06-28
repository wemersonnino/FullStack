package com.escala.authservice.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "marketing_leads",
        indexes = {
                @Index(name = "idx_marketing_leads_email", columnList = "email"),
                @Index(name = "idx_marketing_leads_campaign_created", columnList = "campaignSlug, createdAt"),
                @Index(name = "idx_marketing_leads_source_created", columnList = "utmSource, createdAt")
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketingLead {
    @Id
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    @GeneratedValue
    private UUID id;

    private String email;
    private String name;
    private String phone;
    private String companyName;
    private String employeeRange;
    private String companySegment;
    private String source;

    @Column(name = "lead_status")
    private String leadStatus;

    @Column(name = "marketing_consent_granted", nullable = false)
    @Builder.Default
    private boolean marketingConsentGranted = false;

    @Column(name = "consent_version")
    private String consentVersion;

    @Column(name = "personal_email", nullable = false)
    @Builder.Default
    private boolean personalEmail = false;

    private String recommendedPlan;
    private String recommendedTemplate;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "last_login_at")
    private OffsetDateTime lastLoginAt;

    private String utmSource;
    private String utmMedium;
    private String utmCampaign;
    private String utmContent;
    private String utmTerm;
    private String landingPageSlug;
    private String campaignSlug;
    private String referrer;

    @Builder.Default
    private boolean converted = false;
}
