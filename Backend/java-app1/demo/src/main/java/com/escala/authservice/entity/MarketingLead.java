package com.escala.authservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;
import java.util.Map;

@Entity
@Table(name = "marketing_leads")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketingLead {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;
    private String name;
    private String companyName;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    private String utmSource;
    private String utmMedium;
    private String utmCampaign;
    private String referrer;

    @Builder.Default
    private boolean converted = false;
}
