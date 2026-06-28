package com.escala.authservice.repository;

import com.escala.authservice.entity.AiUsage;
import com.escala.authservice.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.OffsetDateTime;
import java.util.UUID;

public interface AiUsageRepository extends JpaRepository<AiUsage, UUID> {
    long countByCompanyAndUsedAtAfter(Company company, OffsetDateTime since);
    long countByUsedAtAfter(OffsetDateTime since);
}
