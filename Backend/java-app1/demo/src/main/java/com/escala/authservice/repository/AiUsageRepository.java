package com.escala.authservice.repository;

import com.escala.authservice.entity.AiUsage;
import com.escala.authservice.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.OffsetDateTime;

public interface AiUsageRepository extends JpaRepository<AiUsage, Long> {
    long countByCompanyAndUsedAtAfter(Company company, OffsetDateTime since);
    long countByUsedAtAfter(OffsetDateTime since);
}
