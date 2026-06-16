package com.escala.authservice.service;

import com.escala.authservice.dto.LeadCaptureRequest;
import com.escala.authservice.dto.LeadCaptureResponse;
import com.escala.authservice.entity.MarketingLead;
import com.escala.authservice.repository.MarketingLeadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class MarketingLeadService {

    private final MarketingLeadRepository marketingLeadRepository;

    @Transactional
    public LeadCaptureResponse capture(LeadCaptureRequest request) {
        validate(request);

        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        OffsetDateTime now = request.getCapturedAt() != null ? request.getCapturedAt() : OffsetDateTime.now();
        MarketingLead lead = marketingLeadRepository.findByEmailIgnoreCase(email)
                .map(existing -> updateExisting(existing, request, now))
                .orElseGet(() -> createNew(request, email, now));

        MarketingLead saved = marketingLeadRepository.save(lead);
        return LeadCaptureResponse.builder()
                .id(saved.getId())
                .email(saved.getEmail())
                .name(saved.getName())
                .createdAt(saved.getCreatedAt())
                .marketingConsentGranted(saved.isMarketingConsentGranted())
                .converted(saved.isConverted())
                .message("Lead capturado com sucesso")
                .build();
    }

    private void validate(LeadCaptureRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Dados do lead sao obrigatorios");
        }

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email do lead e obrigatorio");
        }

        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException("Nome do lead e obrigatorio");
        }

        if (!Boolean.TRUE.equals(request.getMarketingConsentGranted())) {
            throw new IllegalArgumentException("Consentimento de marketing e obrigatorio");
        }
    }

    private MarketingLead createNew(LeadCaptureRequest request, String email, OffsetDateTime now) {
        return MarketingLead.builder()
                .email(email)
                .name(request.getName().trim())
                .companyName(normalize(request.getCompanyName()))
                .source(defaultString(request.getSource(), "LANDING_PAGE"))
                .leadStatus("WARM")
                .marketingConsentGranted(true)
                .createdAt(now)
                .lastLoginAt(now)
                .utmSource(normalize(request.getUtmSource()))
                .utmMedium(normalize(request.getUtmMedium()))
                .utmCampaign(normalize(request.getUtmCampaign()))
                .utmContent(normalize(request.getUtmContent()))
                .utmTerm(normalize(request.getUtmTerm()))
                .referrer(normalize(request.getReferrer()))
                .landingPageSlug(normalize(request.getLandingPageSlug()))
                .campaignSlug(normalize(request.getCampaignSlug()))
                .build();
    }

    private MarketingLead updateExisting(MarketingLead lead, LeadCaptureRequest request, OffsetDateTime now) {
        lead.setName(request.getName().trim());
        lead.setCompanyName(normalize(request.getCompanyName()));
        lead.setSource(defaultString(request.getSource(), defaultString(lead.getSource(), "LANDING_PAGE")));
        lead.setLeadStatus(defaultString(lead.getLeadStatus(), "WARM"));
        lead.setMarketingConsentGranted(true);
        lead.setLastLoginAt(now);
        lead.setUtmSource(normalize(request.getUtmSource()));
        lead.setUtmMedium(normalize(request.getUtmMedium()));
        lead.setUtmCampaign(normalize(request.getUtmCampaign()));
        lead.setUtmContent(normalize(request.getUtmContent()));
        lead.setUtmTerm(normalize(request.getUtmTerm()));
        lead.setReferrer(normalize(request.getReferrer()));
        lead.setLandingPageSlug(normalize(request.getLandingPageSlug()));
        lead.setCampaignSlug(normalize(request.getCampaignSlug()));
        return lead;
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }

    private String defaultString(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
