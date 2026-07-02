package com.escala.authservice.adapter.billing;

import com.escala.authservice.core.billing.port.PaymentGatewayPort;
import com.escala.authservice.entity.Company;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.model.Subscription;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
public class StripeAdapter implements PaymentGatewayPort {

    @Value("${application.security.stripe.secret-key}")
    private String secretKey;

    @Value("${application.security.stripe.price-essential}")
    private String priceEssential;

    @Value("${application.security.stripe.price-professional}")
    private String priceProfessional;

    @Value("${application.security.stripe.price-critical}")
    private String priceCritical;

    @PostConstruct
    public void init() {
        Stripe.apiKey = secretKey;
    }

    @Override
    public String createCheckoutSession(Company company, String planType, String successUrl, String cancelUrl) {
        String priceId = switch (planType.toUpperCase()) {
            case "ESSENTIAL" -> priceEssential;
            case "PROFESSIONAL" -> priceProfessional;
            case "CRITICAL" -> priceCritical;
            default -> throw new IllegalArgumentException("Plano invalido: " + planType);
        };

        if (priceId == null || priceId.isBlank()) {
            throw new IllegalStateException("ID de preco do Stripe nao configurado para o plano: " + planType);
        }

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                .setClientReferenceId(company.getId().toString())
                .setSuccessUrl(successUrl)
                .setCancelUrl(cancelUrl)
                .addLineItem(SessionCreateParams.LineItem.builder()
                        .setPrice(priceId)
                        .setQuantity(1L)
                        .build())
                .setSubscriptionData(SessionCreateParams.SubscriptionData.builder()
                        .putMetadata("companyId", company.getId().toString())
                        .putMetadata("planType", planType)
                        .build())
                .putMetadata("companyId", company.getId().toString())
                .putMetadata("planType", planType)
                .build();

        try {
            Session session = Session.create(params);
            return session.getUrl();
        } catch (StripeException e) {
            throw new RuntimeException("Erro ao criar sessao de checkout no Stripe", e);
        }
    }

    @Override
    public void cancelSubscription(String stripeSubscriptionId) {
        try {
            Subscription resource = Subscription.retrieve(stripeSubscriptionId);
            resource.cancel();
        } catch (StripeException e) {
            throw new RuntimeException("Erro ao cancelar assinatura no Stripe", e);
        }
    }
}
