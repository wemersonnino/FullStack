package com.escala.authservice.core.billing.usecase;

import com.escala.authservice.core.billing.port.PaymentGatewayPort;
import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.Subscription;
import com.escala.authservice.entity.SubscriptionStatus;
import com.escala.authservice.repository.CompanyRepository;
import com.escala.authservice.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BillingService {

    private final PaymentGatewayPort paymentGatewayPort;
    private final SubscriptionRepository subscriptionRepository;
    private final CompanyRepository companyRepository;

    @Transactional
    public String createCheckoutSession(Long companyId, String planType, String successUrl, String cancelUrl) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Empresa nao encontrada"));

        return paymentGatewayPort.createCheckoutSession(company, planType, successUrl, cancelUrl);
    }

    @Transactional
    public void updateSubscriptionStatus(String stripeSubscriptionId, String stripeCustomerId, SubscriptionStatus status, String planType, Long companyId) {
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
        subscription.setPlanType(planType);
        
        subscriptionRepository.save(subscription);

        // Update company planType if active
        if (status == SubscriptionStatus.ACTIVE || status == SubscriptionStatus.TRIALING) {
            Company company = subscription.getCompany();
            company.setPlanType(planType);
            companyRepository.save(company);
        }
    }

    @Transactional
    public void cancelSubscription(Long companyId) {
        Subscription subscription = subscriptionRepository.findByCompanyId(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Assinatura nao encontrada"));

        paymentGatewayPort.cancelSubscription(subscription.getStripeSubscriptionId());
        subscription.setStatus(SubscriptionStatus.CANCELED);
        subscriptionRepository.save(subscription);
        
        Company company = subscription.getCompany();
        company.setPlanType("FREE");
        companyRepository.save(company);
    }
    
    public Optional<Subscription> getSubscription(Long companyId) {
        return subscriptionRepository.findByCompanyId(companyId);
    }
}
