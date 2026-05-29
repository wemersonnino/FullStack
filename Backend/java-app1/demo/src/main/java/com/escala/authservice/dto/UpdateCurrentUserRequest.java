package com.escala.authservice.dto;

import lombok.Data;

@Data
public class UpdateCurrentUserRequest {
    private String username;
    private String email;
    private String theme;
    private String avatarUrl;
    private String address;
    private String cep;
    private String street;
    private String number;
    private String complement;
    private String neighborhood;
    private String city;
    private String state;
    private String position;
    private String function;
}
