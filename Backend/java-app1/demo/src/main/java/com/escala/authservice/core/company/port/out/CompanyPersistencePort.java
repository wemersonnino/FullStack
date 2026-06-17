package com.escala.authservice.core.company.port.out;

import com.escala.authservice.core.company.domain.CompanyDomain;
import java.util.List;
import java.util.Optional;

public interface CompanyPersistencePort {
    CompanyDomain save(CompanyDomain company);
    Optional<CompanyDomain> findBySlug(String slug);
    List<CompanyDomain> findAll();
}
