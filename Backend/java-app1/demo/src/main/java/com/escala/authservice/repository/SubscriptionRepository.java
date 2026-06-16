package com.escala.authservice.repository;

import com.escala.authservice.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    Optional<Subscription> findByCompanyId(Long companyId);
    Optional<Subscription> findByStripeSubscriptionId(String stripeSubscriptionId);
}
