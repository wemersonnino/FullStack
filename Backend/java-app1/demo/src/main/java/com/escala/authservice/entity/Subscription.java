package com.escala.authservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;

@Entity
@Table(name = "subscriptions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Subscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    private String stripeSubscriptionId;
    private String stripeCustomerId;

    @Enumerated(EnumType.STRING)
    private SubscriptionStatus status;

    private String planType; // ESSENTIAL, PROFESSIONAL, CRITICAL
    
    private OffsetDateTime currentPeriodStart;
    private OffsetDateTime currentPeriodEnd;
    
    private OffsetDateTime canceledAt;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
