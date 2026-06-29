package com.escala.authservice.core.ai.usecase;

import com.escala.authservice.core.ai.port.AiProviderPort;
import com.escala.authservice.core.commercial.domain.PlanLimit;
import com.escala.authservice.core.commercial.usecase.CheckPlanLimitUseCase;
import com.escala.authservice.entity.AiUsage;
import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.AiUsageRepository;
import com.escala.authservice.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiAssistantUseCase {
    private final AiProviderPort aiProviderPort;
    private final AiUsageRepository aiUsageRepository;
    private final CurrentUserService currentUserService;
    private final CheckPlanLimitUseCase checkPlanLimitUseCase;

    @Transactional
    public String executeAiTask(String userEmail, String feature, Map<String, Object> context, String instruction) {
        User user = currentUserService.requireCurrentUser(userEmail);
        Company company = user.getCompany();

        // 1. Validar se o plano permite IA
        checkPlanLimitUseCase.validateFeatureAccess(company.getPlanType(), "AI_ASSISTANT");

        // 2. Validar créditos/limites mensais
        PlanLimit limits = PlanLimit.getLimitsForPlan(company.getPlanType());
        long usedThisMonth = aiUsageRepository.countByCompanyAndUsedAtAfter(company, OffsetDateTime.now().withDayOfMonth(1));

        if (usedThisMonth >= limits.getAiCreditsPerMonth()) {
            throw new IllegalStateException("Limite de créditos de IA para o mês atingido (" + limits.getAiCreditsPerMonth() + "). Faça upgrade ou aguarde o próximo ciclo.");
        }

        // 3. Chamar Provider de IA
        String response = aiProviderPort.generateResponse(context, instruction);

        // 4. Registrar uso
        AiUsage usage = AiUsage.builder()
                .user(user)
                .company(company)
                .feature(feature)
                .usedAt(OffsetDateTime.now())
                .creditsConsumed(1)
                .promptRef(instruction.length() > 255 ? instruction.substring(0, 252) + "..." : instruction)
                .build();
        aiUsageRepository.save(usage);

        return response;
    }
}
