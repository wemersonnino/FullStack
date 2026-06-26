package com.escala.authservice.service;

import com.escala.authservice.dto.LeadCaptureRequest;
import com.escala.authservice.dto.LeadCaptureResponse;
import com.escala.authservice.core.commercial.domain.LeadQualification;
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
                .personalEmail(saved.isPersonalEmail())
                .recommendedPlan(saved.getRecommendedPlan())
                .recommendedTemplate(saved.getRecommendedTemplate())
                .converted(saved.isConverted())
                .message(saved.isPersonalEmail()
                        ? "Lead capturado. Sinalizamos que o email parece pessoal para qualificar o contato."
                        : "Lead capturado com sucesso")
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

        if (request.getCompanySegment() == null || request.getCompanySegment().isBlank()) {
            throw new IllegalArgumentException("Segmento da empresa e obrigatorio");
        }

        if (request.getEmployeeRange() == null || request.getEmployeeRange().isBlank()) {
            throw new IllegalArgumentException("Faixa de colaboradores e obrigatoria");
        }

        if (!Boolean.TRUE.equals(request.getMarketingConsentGranted())) {
            throw new IllegalArgumentException("Consentimento de marketing e obrigatorio");
        }
    }

    private MarketingLead createNew(LeadCaptureRequest request, String email, OffsetDateTime now) {
        String segment = normalize(request.getCompanySegment());
        String employeeRange = normalize(request.getEmployeeRange());
        LeadQualification qualification = LeadQualification.of(email, segment, employeeRange);

        return MarketingLead.builder()
                .email(email)
                .name(request.getName().trim())
                .phone(normalizePhone(request.getPhone()))
                .companyName(normalize(request.getCompanyName()))
                .employeeRange(employeeRange)
                .companySegment(segment)
                .source(defaultString(request.getSource(), "LANDING_PAGE"))
                .leadStatus(qualification.leadStatus())
                .marketingConsentGranted(true)
                .consentVersion(defaultString(request.getConsentVersion(), "marketing-consent-v1"))
                .personalEmail(qualification.personalEmail())
                .recommendedPlan(qualification.recommendedPlan())
                .recommendedTemplate(qualification.recommendedTemplate())
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
        String segment = normalize(request.getCompanySegment());
        String employeeRange = normalize(request.getEmployeeRange());
        LeadQualification qualification = LeadQualification.of(lead.getEmail(), segment, employeeRange);

        lead.setName(request.getName().trim());
        lead.setPhone(normalizePhone(request.getPhone()));
        lead.setCompanyName(normalize(request.getCompanyName()));
        lead.setEmployeeRange(employeeRange);
        lead.setCompanySegment(segment);
        lead.setSource(defaultString(request.getSource(), defaultString(lead.getSource(), "LANDING_PAGE")));
        lead.setLeadStatus(qualification.leadStatus());
        lead.setMarketingConsentGranted(true);
        lead.setConsentVersion(defaultString(request.getConsentVersion(), defaultString(lead.getConsentVersion(), "marketing-consent-v1")));
        lead.setPersonalEmail(qualification.personalEmail());
        lead.setRecommendedPlan(qualification.recommendedPlan());
        lead.setRecommendedTemplate(qualification.recommendedTemplate());
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

    private String normalizePhone(String value) {
        String normalized = normalize(value);
        if (normalized == null) {
            return null;
        }
        String digits = normalized.replaceAll("\\D", "");
        if (digits.isBlank()) {
            return null;
        }
        if (digits.startsWith("55")) {
            return "+" + digits;
        }
        if (digits.length() == 10 || digits.length() == 11) {
            return "+55" + digits;
        }
        return normalized;
    }

}
