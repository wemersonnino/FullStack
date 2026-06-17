package com.escala.authservice.core.billing.port;

import com.escala.authservice.entity.Company;

public interface PaymentGatewayPort {
    String createCheckoutSession(Company company, String planType, String successUrl, String cancelUrl);
    void cancelSubscription(String stripeSubscriptionId);
}
