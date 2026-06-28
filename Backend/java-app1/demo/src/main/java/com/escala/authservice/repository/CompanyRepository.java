package com.escala.authservice.repository;

import com.escala.authservice.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CompanyRepository extends JpaRepository<Company, UUID> {
    Optional<Company> findBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, UUID id);
    long countByPlanType(String planType);
}
