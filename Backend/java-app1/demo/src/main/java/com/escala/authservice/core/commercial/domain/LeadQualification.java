package com.escala.authservice.core.commercial.domain;

import java.util.Locale;
import java.util.Set;

public final class LeadQualification {
    private static final Set<String> PERSONAL_EMAIL_DOMAINS = Set.of(
            "gmail.com",
            "googlemail.com",
            "hotmail.com",
            "outlook.com",
            "live.com",
            "yahoo.com",
            "icloud.com",
            "bol.com.br",
            "uol.com.br",
            "terra.com.br",
            "proton.me"
    );

    private final String email;
    private final String companySegment;
    private final String employeeRange;

    private LeadQualification(String email, String companySegment, String employeeRange) {
        this.email = normalize(email);
        this.companySegment = normalize(companySegment);
        this.employeeRange = normalize(employeeRange);
    }

    public static LeadQualification of(String email, String companySegment, String employeeRange) {
        return new LeadQualification(email, companySegment, employeeRange);
    }

    public boolean personalEmail() {
        int atIndex = email == null ? -1 : email.lastIndexOf('@');
        if (atIndex < 0 || atIndex == email.length() - 1) {
            return false;
        }
        String domain = email.substring(atIndex + 1).toLowerCase(Locale.ROOT);
        return PERSONAL_EMAIL_DOMAINS.contains(domain);
    }

    public String recommendedPlan() {
        String segment = lower(companySegment);
        String range = lower(employeeRange);

        if (range.contains("201") || range.contains("500") || range.contains("1000")) {
            return "operacao-critica";
        }
        if (segment.contains("seguranca")
                || segment.contains("logistica")
                || segment.contains("saude")
                || segment.contains("facilities")
                || segment.contains("24x7")) {
            return "profissional";
        }
        if (range.contains("51") || range.contains("101")) {
            return "profissional";
        }
        return "essencial";
    }

    public String recommendedTemplate() {
        String segment = lower(companySegment);

        if (segment.contains("saude")
                || segment.contains("seguranca")
                || segment.contains("24x7")) {
            return "12x36";
        }
        if (segment.contains("restaurante")
                || segment.contains("varejo")
                || segment.contains("logistica")) {
            return "6x1";
        }
        return "5x2";
    }

    public String leadStatus() {
        String range = lower(employeeRange);
        if (range.contains("201") || range.contains("500") || range.contains("1000")) {
            return "SALES_QUALIFIED";
        }
        return personalEmail() ? "NEEDS_QUALIFICATION" : "WARM";
    }

    private static String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }

    private static String lower(String value) {
        return value == null ? "" : value.toLowerCase(Locale.ROOT);
    }
}
