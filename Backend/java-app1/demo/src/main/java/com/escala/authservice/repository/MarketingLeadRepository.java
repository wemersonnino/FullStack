package com.escala.authservice.repository;

import com.escala.authservice.entity.MarketingLead;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MarketingLeadRepository extends JpaRepository<MarketingLead, Long> {
    long countByConvertedTrue();

    Optional<MarketingLead> findByEmailIgnoreCase(String email);
}
