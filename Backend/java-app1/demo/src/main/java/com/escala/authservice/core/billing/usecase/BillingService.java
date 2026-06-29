package com.escala.authservice.core.billing.usecase;

import com.escala.authservice.core.billing.port.PaymentGatewayPort;
import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.Subscription;
import com.escala.authservice.entity.SubscriptionStatus;
import com.escala.authservice.repository.CompanyRepository;
import com.escala.authservice.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BillingService {

    private final PaymentGatewayPort paymentGatewayPort;
    private final SubscriptionRepository subscriptionRepository;
    private final CompanyRepository companyRepository;

    @Transactional
    public String createCheckoutSession(UUID companyId, String planType, String successUrl, String cancelUrl) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Empresa nao encontrada"));

        return paymentGatewayPort.createCheckoutSession(company, normalizePlanType(planType), successUrl, cancelUrl);
    }

    @Transactional
    public void updateSubscriptionStatus(String stripeSubscriptionId, String stripeCustomerId, SubscriptionStatus status, String planType, UUID companyId) {
        Subscription subscription = subscriptionRepository.findByStripeSubscriptionId(stripeSubscriptionId)
                .orElseGet(() -> {
                    Company company = companyRepository.findById(companyId)
                            .orElseThrow(() -> new IllegalArgumentException("Empresa nao encontrada para nova assinatura"));
                    return Subscription.builder()
                            .company(company)
                            .stripeSubscriptionId(stripeSubscriptionId)
                            .build();
                });

        subscription.setStripeCustomerId(stripeCustomerId);
        subscription.setStatus(status);
        subscription.setPlanType(normalizePlanType(planType));
        
        subscriptionRepository.save(subscription);

        // Update company planType if active
        if (status == SubscriptionStatus.ACTIVE || status == SubscriptionStatus.TRIALING) {
            Company company = subscription.getCompany();
            company.setPlanType(subscription.getPlanType());
            companyRepository.save(company);
        }
    }

    @Transactional
    public void cancelSubscription(UUID companyId) {
        Subscription subscription = subscriptionRepository.findByCompanyId(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Assinatura nao encontrada"));

        paymentGatewayPort.cancelSubscription(subscription.getStripeSubscriptionId());
        subscription.setStatus(SubscriptionStatus.CANCELED);
        subscription.setCanceledAt(OffsetDateTime.now());
        subscriptionRepository.save(subscription);
        
        Company company = subscription.getCompany();
        company.setPlanType("FREE");
        companyRepository.save(company);
    }
    
    public Optional<Subscription> getSubscription(UUID companyId) {
        return subscriptionRepository.findByCompanyId(companyId);
    }

    private String normalizePlanType(String planType) {
        if (planType == null || planType.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "planType obrigatorio");
        }

        String normalized = planType.trim().toUpperCase(Locale.ROOT);
        return switch (normalized) {
            case "ESSENTIAL", "PROFESSIONAL", "CRITICAL" -> normalized;
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "planType invalido");
        };
    }
}
