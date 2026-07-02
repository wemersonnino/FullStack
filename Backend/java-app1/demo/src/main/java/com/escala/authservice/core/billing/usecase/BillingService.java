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
                    if (companyId == null) {
                        throw new IllegalArgumentException("companyId obrigatorio para nova assinatura");
                    }
                    Company company = companyRepository.findById(companyId)
                            .orElseThrow(() -> new IllegalArgumentException("Empresa nao encontrada para nova assinatura"));
                    return Subscription.builder()
                            .company(company)
                            .stripeSubscriptionId(stripeSubscriptionId)
                            .build();
                });

        subscription.setStripeCustomerId(stripeCustomerId);
        subscription.setStatus(status);
        if (planType != null && !planType.isBlank()) {
            subscription.setPlanType(normalizePlanType(planType));
        } else if (isEntitledStatus(status) && (subscription.getPlanType() == null || subscription.getPlanType().isBlank())) {
            throw new IllegalArgumentException("planType obrigatorio para assinatura ativa");
        }
        if (status == SubscriptionStatus.CANCELED) {
            subscription.setCanceledAt(OffsetDateTime.now());
        } else if (status == SubscriptionStatus.ACTIVE || status == SubscriptionStatus.TRIALING) {
            subscription.setCanceledAt(null);
        }
        
        subscriptionRepository.save(subscription);
        syncCompanyPlan(subscription.getCompany(), subscription);
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

    private void syncCompanyPlan(Company company, Subscription subscription) {
        SubscriptionStatus status = subscription.getStatus();

        if (isEntitledStatus(status)) {
            company.setPlanType(subscription.getPlanType());
            companyRepository.save(company);
            return;
        }

        if (status == SubscriptionStatus.CANCELED
                || status == SubscriptionStatus.UNPAID
                || status == SubscriptionStatus.INCOMPLETE_EXPIRED) {
            company.setPlanType("FREE");
            companyRepository.save(company);
        }
    }

    private boolean isEntitledStatus(SubscriptionStatus status) {
        return status == SubscriptionStatus.ACTIVE || status == SubscriptionStatus.TRIALING;
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
