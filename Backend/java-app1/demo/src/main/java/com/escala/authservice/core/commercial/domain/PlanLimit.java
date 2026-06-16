package com.escala.authservice.core.commercial.domain;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PlanLimit {
    private String planType;
    private int maxEmployees;
    private boolean allowsGeolocation;
    private boolean allowsAiAssistant;
    private int aiCreditsPerMonth;
    private boolean allowsWorkPosts;

    public static PlanLimit getLimitsForPlan(String planType) {
        switch (planType == null ? "FREE" : planType.toUpperCase()) {
            case "TRIAL":
                return PlanLimit.builder()
                        .planType("TRIAL")
                        .maxEmployees(50)
                        .allowsGeolocation(true)
                        .allowsAiAssistant(true)
                        .aiCreditsPerMonth(20)
                        .allowsWorkPosts(true)
                        .build();
            case "ESSENTIAL":
                return PlanLimit.builder()
                        .planType("ESSENTIAL")
                        .maxEmployees(20)
                        .allowsGeolocation(false)
                        .allowsAiAssistant(false)
                        .aiCreditsPerMonth(0)
                        .allowsWorkPosts(false)
                        .build();
            case "PROFESSIONAL":
                return PlanLimit.builder()
                        .planType("PROFESSIONAL")
                        .maxEmployees(100)
                        .allowsGeolocation(true)
                        .allowsAiAssistant(false)
                        .aiCreditsPerMonth(0)
                        .allowsWorkPosts(true)
                        .build();
            case "CRITICAL":
                return PlanLimit.builder()
                        .planType("CRITICAL")
                        .maxEmployees(1000)
                        .allowsGeolocation(true)
                        .allowsAiAssistant(true)
                        .aiCreditsPerMonth(100)
                        .allowsWorkPosts(true)
                        .build();
            default:
                return PlanLimit.builder()
                        .planType("FREE")
                        .maxEmployees(5)
                        .allowsGeolocation(false)
                        .allowsAiAssistant(false)
                        .aiCreditsPerMonth(0)
                        .allowsWorkPosts(false)
                        .build();
        }
    }
}
