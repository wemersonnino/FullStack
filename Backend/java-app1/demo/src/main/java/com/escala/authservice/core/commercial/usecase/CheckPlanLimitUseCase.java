package com.escala.authservice.core.commercial.usecase;

import com.escala.authservice.core.commercial.domain.PlanLimit;
import org.springframework.stereotype.Service;

@Service
public class CheckPlanLimitUseCase {

    public boolean canAddEmployee(String planType, int currentEmployeeCount) {
        PlanLimit limit = PlanLimit.getLimitsForPlan(planType);
        return currentEmployeeCount < limit.getMaxEmployees();
    }

    public void validateFeatureAccess(String planType, String feature) {
        PlanLimit limit = PlanLimit.getLimitsForPlan(planType);
        boolean hasAccess = switch (feature.toUpperCase()) {
            case "GEOLOCATION" -> limit.isAllowsGeolocation();
            case "AI_ASSISTANT" -> limit.isAllowsAiAssistant();
            case "WORK_POSTS" -> limit.isAllowsWorkPosts();
            default -> false;
        };

        if (!hasAccess) {
            throw new IllegalStateException("O plano " + planType + " não permite o uso da funcionalidade: " + feature + ". Faça upgrade do seu plano.");
        }
    }
}
