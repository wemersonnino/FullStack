package com.escala.authservice.core.billing.usecase;

import com.escala.authservice.core.billing.port.PaymentGatewayPort;
import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.Subscription;
import com.escala.authservice.entity.SubscriptionStatus;
import com.escala.authservice.repository.CompanyRepository;
import com.escala.authservice.repository.SubscriptionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BillingServiceTest {

    @Mock
    private PaymentGatewayPort paymentGatewayPort;
    @Mock
    private SubscriptionRepository subscriptionRepository;
    @Mock
    private CompanyRepository companyRepository;

    @InjectMocks
    private BillingService billingService;

    @Test
    void updateSubscriptionStatusDowngradesCompanyOnCanceledWebhook() {
        Company company = Company.builder()
                .id(UUID.randomUUID())
                .name("Empresa")
                .slug("empresa")
                .planType("CRITICAL")
                .build();
        Subscription subscription = Subscription.builder()
                .id(UUID.randomUUID())
                .company(company)
                .stripeSubscriptionId("sub_123")
                .planType("CRITICAL")
                .status(SubscriptionStatus.ACTIVE)
                .build();

        when(subscriptionRepository.findByStripeSubscriptionId("sub_123")).thenReturn(Optional.of(subscription));
        when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(companyRepository.save(any(Company.class))).thenAnswer(invocation -> invocation.getArgument(0));

        billingService.updateSubscriptionStatus("sub_123", "cus_123", SubscriptionStatus.CANCELED, null, null);

        assertEquals(SubscriptionStatus.CANCELED, subscription.getStatus());
        assertEquals("FREE", company.getPlanType());
        verify(companyRepository).save(company);
    }

    @Test
    void updateSubscriptionStatusKeepsExistingPlanWhenStripeUpdateOmitsMetadata() {
        Company company = Company.builder()
                .id(UUID.randomUUID())
                .name("Empresa")
                .slug("empresa")
                .planType("ESSENTIAL")
                .build();
        Subscription subscription = Subscription.builder()
                .id(UUID.randomUUID())
                .company(company)
                .stripeSubscriptionId("sub_456")
                .planType("ESSENTIAL")
                .status(SubscriptionStatus.PAST_DUE)
                .build();

        when(subscriptionRepository.findByStripeSubscriptionId("sub_456")).thenReturn(Optional.of(subscription));
        when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(invocation -> invocation.getArgument(0));

        billingService.updateSubscriptionStatus("sub_456", "cus_456", SubscriptionStatus.ACTIVE, null, null);

        assertEquals(SubscriptionStatus.ACTIVE, subscription.getStatus());
        assertEquals("ESSENTIAL", subscription.getPlanType());
        assertEquals("ESSENTIAL", company.getPlanType());
        verify(companyRepository).save(company);
    }

    @Test
    void updateSubscriptionStatusRejectsNewActiveSubscriptionWithoutCompanyMetadata() {
        when(subscriptionRepository.findByStripeSubscriptionId("sub_new")).thenReturn(Optional.empty());

        assertThrows(
                IllegalArgumentException.class,
                () -> billingService.updateSubscriptionStatus("sub_new", "cus_new", SubscriptionStatus.ACTIVE, "PROFESSIONAL", null)
        );

        verify(companyRepository, never()).save(any(Company.class));
    }
}
