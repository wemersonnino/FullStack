package com.escala.authservice.service;

import com.escala.authservice.dto.CompanyRequest;
import com.escala.authservice.entity.Company;
import com.escala.authservice.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CompanyService {
    public static final String DEFAULT_COMPANY_SLUG = "escala-demo";

    private final CompanyRepository companyRepository;
    private final com.escala.authservice.core.company.port.in.CompanyUseCase companyUseCase;

    public List<Company> list() {
        return companyRepository.findAll();
    }

    public Company findById(Long id) {
        return companyRepository.findById(id).orElseThrow();
    }

    public Company resolve(String slug) {
        String normalized = (slug == null || slug.isBlank()) ? DEFAULT_COMPANY_SLUG : slug.trim().toLowerCase();
        // Delegar para o core
        var domain = companyUseCase.resolve(normalized);
        return companyRepository.findById(domain.getId()).orElseThrow();
    }

    public boolean existsBySlugAndIdNot(String slug, Long id) {
        return companyRepository.existsBySlugAndIdNot(slug, id);
    }

    public Company create(CompanyRequest request) {
        // Mapear DTO -> Domain
        var domain = com.escala.authservice.core.company.domain.CompanyDomain.builder()
                .name(request.getName())
                .cnpj(request.getCnpj())
                .active(request.getActive() == null || request.getActive())
                .planType(request.getPlanType() != null ? request.getPlanType() : "TRIAL")
                .trialExpiresAt(request.getTrialExpiresAt() != null ? request.getTrialExpiresAt() : OffsetDateTime.now().plusDays(14))
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .build();
        
        // Delegar para o Core
        var savedDomain = companyUseCase.create(domain);
        
        // Retornar entidade para compatibilidade legado
        return companyRepository.findById(savedDomain.getId()).orElseThrow();
    }

    public Company update(Long id, CompanyRequest request) {
        Company company = findById(id);
        company.setName(request.getName());
        company.setCnpj(request.getCnpj());
        company.setLogoUrl(request.getLogoUrl());
        company.setLatitude(request.getLatitude());
        company.setLongitude(request.getLongitude());
        if (request.getAllowedRadius() != null) {
            company.setAllowedRadius(request.getAllowedRadius());
        }
        company.setAddress(request.getAddress());
        company.setCep(request.getCep());
        company.setStreet(request.getStreet());
        company.setNumber(request.getNumber());
        company.setComplement(request.getComplement());
        company.setNeighborhood(request.getNeighborhood());
        company.setCity(request.getCity());
        company.setState(request.getState());
        if (request.getActive() != null) {
            company.setActive(request.getActive());
        }
        if (request.getPlanType() != null) {
            company.setPlanType(request.getPlanType());
        }
        if (request.getTrialExpiresAt() != null) {
            company.setTrialExpiresAt(request.getTrialExpiresAt());
        }
        return companyRepository.save(company);
    }

    public void delete(Long id) {
        companyRepository.deleteById(id);
    }
}
