package com.escala.authservice.repository;

import com.escala.authservice.entity.MarketingLead;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface MarketingLeadRepository extends JpaRepository<MarketingLead, UUID> {
    long countByConvertedTrue();

    Optional<MarketingLead> findByEmailIgnoreCase(String email);
}
