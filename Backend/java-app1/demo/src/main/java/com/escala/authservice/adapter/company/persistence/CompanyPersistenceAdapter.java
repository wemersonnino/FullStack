package com.escala.authservice.adapter.company.persistence;

import com.escala.authservice.core.company.domain.CompanyDomain;
import com.escala.authservice.core.company.port.out.CompanyPersistencePort;
import com.escala.authservice.entity.Company;
import com.escala.authservice.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class CompanyPersistenceAdapter implements CompanyPersistencePort {
    private final CompanyRepository repository;

    @Override
    public CompanyDomain save(CompanyDomain domain) {
        Company entity = toEntity(domain);
        Company saved = repository.save(entity);
        return toDomain(saved);
    }

    @Override
    public Optional<CompanyDomain> findBySlug(String slug) {
        return repository.findBySlug(slug).map(this::toDomain);
    }

    @Override
    public List<CompanyDomain> findAll() {
        return repository.findAll().stream().map(this::toDomain).toList();
    }

    private Company toEntity(CompanyDomain domain) {
        return Company.builder()
                .id(domain.getId())
                .name(domain.getName())
                .slug(domain.getSlug())
                .cnpj(domain.getCnpj())
                .active(domain.isActive())
                .planType(domain.getPlanType())
                .trialExpiresAt(domain.getTrialExpiresAt())
                .latitude(domain.getLatitude())
                .longitude(domain.getLongitude())
                .build();
    }

    private CompanyDomain toDomain(Company entity) {
        return CompanyDomain.builder()
                .id(entity.getId())
                .name(entity.getName())
                .slug(entity.getSlug())
                .cnpj(entity.getCnpj())
                .active(entity.isActive())
                .planType(entity.getPlanType())
                .trialExpiresAt(entity.getTrialExpiresAt())
                .latitude(entity.getLatitude())
                .longitude(entity.getLongitude())
                .build();
    }
}
