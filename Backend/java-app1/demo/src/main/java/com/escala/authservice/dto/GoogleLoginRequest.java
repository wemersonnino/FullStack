package com.escala.authservice.dto;

import lombok.Data;

@Data
public class GoogleLoginRequest {
    private String idToken;
    private String companySlug;
    private String recaptchaToken;
}
