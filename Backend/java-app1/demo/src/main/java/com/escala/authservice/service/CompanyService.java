package com.escala.authservice.service;

import com.escala.authservice.dto.CompanyRequest;
import com.escala.authservice.entity.Company;
import com.escala.authservice.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.UUID;
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

    public Company findById(UUID id) {
        return companyRepository.findById(id).orElseThrow();
    }

    public Company resolve(String slug) {
        String normalized = (slug == null || slug.isBlank()) ? DEFAULT_COMPANY_SLUG : slug.trim().toLowerCase();
        // Delegar para o core
        var domain = companyUseCase.resolve(normalized);
        return companyRepository.findById(domain.getId()).orElseThrow();
    }

    public boolean existsBySlugAndIdNot(String slug, UUID id) {
        return companyRepository.existsBySlugAndIdNot(slug, id);
    }

    private String sanitize(String input) {
        if (input == null) return null;
        return input.replaceAll("<[^>]*>", "").trim();
    }

    private String validateAndCleanCnpj(String cnpj) {
        if (cnpj == null || cnpj.isBlank()) return null;
        String cleaned = cnpj.replaceAll("[.\\-/\\s]", "").trim().toUpperCase();
        if (!cleaned.matches("^[A-Z0-9]{12}[0-9]{2}$")) {
            throw new IllegalArgumentException("Formato de CNPJ invalido. O CNPJ deve possuir 14 caracteres (formato numerico ou alfanumerico com digitos verificadores numericos)");
        }
        return cleaned;
    }

    public Company create(CompanyRequest request) {
        String cleanCnpj = validateAndCleanCnpj(request.getCnpj());
        
        // Mapear DTO -> Domain
        var domain = com.escala.authservice.core.company.domain.CompanyDomain.builder()
                .name(sanitize(request.getName()))
                .cnpj(cleanCnpj)
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

    public Company update(UUID id, CompanyRequest request) {
        Company company = findById(id);
        
        String cleanCnpj = validateAndCleanCnpj(request.getCnpj());
        
        company.setName(sanitize(request.getName()));
        company.setCnpj(cleanCnpj);
        company.setLogoUrl(sanitize(request.getLogoUrl()));
        company.setLatitude(request.getLatitude());
        company.setLongitude(request.getLongitude());
        if (request.getAllowedRadius() != null) {
            company.setAllowedRadius(request.getAllowedRadius());
        }
        company.setAddress(sanitize(request.getAddress()));
        company.setCep(sanitize(request.getCep()));
        company.setStreet(sanitize(request.getStreet()));
        company.setNumber(sanitize(request.getNumber()));
        company.setComplement(sanitize(request.getComplement()));
        company.setNeighborhood(sanitize(request.getNeighborhood()));
        company.setCity(sanitize(request.getCity()));
        company.setState(sanitize(request.getState()));
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

    public void delete(UUID id) {
        companyRepository.deleteById(id);
    }
}
