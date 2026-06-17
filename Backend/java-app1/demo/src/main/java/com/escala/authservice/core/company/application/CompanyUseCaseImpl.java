package com.escala.authservice.core.company.application;

import com.escala.authservice.core.company.domain.CompanyDomain;
import com.escala.authservice.core.company.port.in.CompanyUseCase;
import com.escala.authservice.core.company.port.out.CompanyPersistencePort;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
public class CompanyUseCaseImpl implements CompanyUseCase {
    private final CompanyPersistencePort companyPersistencePort;

    @Override
    public CompanyDomain create(CompanyDomain company) {
        if (company.getSlug() == null || company.getSlug().isBlank()) {
            company.setSlug(company.getName().toLowerCase().replaceAll("[^a-z0-9]", "-") 
                    + "-" + UUID.randomUUID().toString().substring(0, 4));
        }
        return companyPersistencePort.save(company);
    }

    @Override
    public CompanyDomain resolve(String slug) {
        return companyPersistencePort.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Empresa não encontrada"));
    }

    @Override
    public List<CompanyDomain> listAll() {
        return companyPersistencePort.findAll();
    }
}
