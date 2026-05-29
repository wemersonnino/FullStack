package com.escala.authservice.dto;

import lombok.Data;

@Data
public class CompanyRequest {
    private String name;
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
    private Boolean active;
}
