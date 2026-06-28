package com.escala.authservice.dto;

import java.util.UUID;

import com.escala.authservice.entity.Company;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CompanyResponse {
    private UUID id;
    private String name;
    private String slug;
    private String cnpj;
    private String logoUrl;
    private Double latitude;
    private Double longitude;
    private Integer allowedRadius;
    private String address;
    private String cep;
    private String street;
    private String number;
    private String complement;
    private String neighborhood;
    private String city;
    private String state;
    private boolean active;

    public static CompanyResponse from(Company company) {
        return CompanyResponse.builder()
                .id(company.getId())
                .name(company.getName())
                .slug(company.getSlug())
                .cnpj(company.getCnpj())
                .logoUrl(company.getLogoUrl())
                .address(company.getAddress())
                .cep(company.getCep())
                .street(company.getStreet())
                .number(company.getNumber())
                .complement(company.getComplement())
                .neighborhood(company.getNeighborhood())
                .city(company.getCity())
                .state(company.getState())
                .active(company.isActive())
                .build();
    }
}
