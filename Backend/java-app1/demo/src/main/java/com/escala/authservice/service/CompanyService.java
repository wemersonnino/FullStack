package com.escala.authservice.service;

import com.escala.authservice.dto.CompanyRequest;
import com.escala.authservice.entity.Company;
import com.escala.authservice.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CompanyService {
    public static final String DEFAULT_COMPANY_SLUG = "escala-demo";

    private final CompanyRepository companyRepository;

    public List<Company> list() {
        return companyRepository.findAll();
    }

    public Company findById(Long id) {
        return companyRepository.findById(id).orElseThrow();
    }

    public Company resolve(String slug) {
        String normalized = (slug == null || slug.isBlank()) ? DEFAULT_COMPANY_SLUG : slug.trim().toLowerCase();
        return companyRepository.findBySlug(normalized)
                .orElseThrow(() -> new IllegalArgumentException("Empresa nao encontrada"));
    }

    public Company create(CompanyRequest request) {
        String slug = request.getName().toLowerCase().replaceAll("[^a-z0-9]", "-");
        return companyRepository.save(Company.builder()
                .name(request.getName())
                .slug(slug)
                .cnpj(request.getCnpj())
                .logoUrl(request.getLogoUrl())
                .address(request.getAddress())
                .cep(request.getCep())
                .street(request.getStreet())
                .number(request.getNumber())
                .complement(request.getComplement())
                .neighborhood(request.getNeighborhood())
                .city(request.getCity())
                .state(request.getState())
                .active(request.getActive() == null || request.getActive())
                .build());
    }

    public Company update(Long id, CompanyRequest request) {
        Company company = findById(id);
        company.setName(request.getName());
        company.setCnpj(request.getCnpj());
        company.setLogoUrl(request.getLogoUrl());
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
        return companyRepository.save(company);
    }

    public void delete(Long id) {
        companyRepository.deleteById(id);
    }
}
