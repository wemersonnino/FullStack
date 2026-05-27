package com.escala.authservice.service;

import com.escala.authservice.entity.Company;
import com.escala.authservice.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CompanyService {
    public static final String DEFAULT_COMPANY_SLUG = "escala-demo";

    private final CompanyRepository companyRepository;

    public Company resolve(String slug) {
        String normalized = (slug == null || slug.isBlank()) ? DEFAULT_COMPANY_SLUG : slug.trim().toLowerCase();
        return companyRepository.findBySlug(normalized)
                .orElseThrow(() -> new IllegalArgumentException("Empresa nao encontrada"));
    }
}
