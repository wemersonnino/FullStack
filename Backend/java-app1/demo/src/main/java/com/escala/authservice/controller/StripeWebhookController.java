package com.escala.authservice.controller;

import java.util.UUID;

import com.escala.authservice.core.billing.usecase.BillingService;
import com.escala.authservice.entity.SubscriptionStatus;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.StripeObject;
import com.stripe.model.Subscription;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/billing/webhook")
@RequiredArgsConstructor
@Slf4j
public class StripeWebhookController {

    private final BillingService billingService;

    @Value("${application.security.stripe.webhook-secret}")
    private String endpointSecret;

    @PostMapping
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader
    ) {
        Event event;

        try {
            event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
        } catch (SignatureVerificationException e) {
            log.error("Assinatura do Webhook invalida", e);
            return ResponseEntity.badRequest().body("Assinatura invalida");
        }

        EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
        StripeObject stripeObject = null;
        if (dataObjectDeserializer.getObject().isPresent()) {
            stripeObject = dataObjectDeserializer.getObject().get();
        } else {
            log.warn("Falha ao deserializar objeto do Stripe");
            return ResponseEntity.ok("Evento recebido mas nao processado");
        }

        switch (event.getType()) {
            case "checkout.session.completed":
                handleCheckoutSessionCompleted((Session) stripeObject);
                break;
            case "customer.subscription.updated":
            case "customer.subscription.deleted":
                handleSubscriptionUpdated((Subscription) stripeObject);
                break;
            default:
                log.info("Evento do Stripe nao tratado: {}", event.getType());
        }

        return ResponseEntity.ok("Evento processado");
    }

    private void handleCheckoutSessionCompleted(Session session) {
        String stripeSubscriptionId = requireNonBlank(session.getSubscription(), "subscriptionId");
        String stripeCustomerId = requireNonBlank(session.getCustomer(), "customerId");
        String planType = requireMetadata(session.getMetadata(), "planType");
        UUID companyId = requireUuidMetadata(session.getMetadata(), "companyId");

        billingService.updateSubscriptionStatus(
                stripeSubscriptionId,
                stripeCustomerId,
                SubscriptionStatus.ACTIVE,
                planType,
                companyId
        );
    }

    private void handleSubscriptionUpdated(Subscription stripeSubscription) {
        String stripeSubscriptionId = requireNonBlank(stripeSubscription.getId(), "subscriptionId");
        String stripeCustomerId = requireNonBlank(stripeSubscription.getCustomer(), "customerId");
        SubscriptionStatus status = mapStripeStatus(stripeSubscription.getStatus());
        String planType = readMetadata(stripeSubscription.getMetadata(), "planType");
        UUID companyId = readUuidMetadata(stripeSubscription.getMetadata(), "companyId");

        billingService.updateSubscriptionStatus(
                stripeSubscriptionId,
                stripeCustomerId,
                status,
                planType,
                companyId
        );
    }

    private String requireMetadata(Map<String, String> metadata, String key) {
        String value = readMetadata(metadata, key);
        if (value == null) {
            throw new IllegalArgumentException("Metadata obrigatoria ausente: " + key);
        }
        return value;
    }

    private UUID requireUuidMetadata(Map<String, String> metadata, String key) {
        UUID value = readUuidMetadata(metadata, key);
        if (value == null) {
            throw new IllegalArgumentException("Metadata UUID obrigatoria ausente: " + key);
        }
        return value;
    }

    private String readMetadata(Map<String, String> metadata, String key) {
        if (metadata == null) {
            return null;
        }

        String value = metadata.get(key);
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private UUID readUuidMetadata(Map<String, String> metadata, String key) {
        String value = readMetadata(metadata, key);
        if (value == null) {
            return null;
        }
        return UUID.fromString(value);
    }

    private String requireNonBlank(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " obrigatorio");
        }
        return value;
    }

    private SubscriptionStatus mapStripeStatus(String stripeStatus) {
        return switch (stripeStatus) {
            case "active" -> SubscriptionStatus.ACTIVE;
            case "past_due" -> SubscriptionStatus.PAST_DUE;
            case "canceled" -> SubscriptionStatus.CANCELED;
            case "incomplete" -> SubscriptionStatus.INCOMPLETE;
            case "incomplete_expired" -> SubscriptionStatus.INCOMPLETE_EXPIRED;
            case "trialing" -> SubscriptionStatus.TRIALING;
            case "unpaid" -> SubscriptionStatus.UNPAID;
            default -> SubscriptionStatus.CANCELED;
        };
    }
}
