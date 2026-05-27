package com.escala.authservice.dto;

import lombok.Data;

@Data
public class ForgotPasswordRequest {
    private String email;
    private String companySlug;
    private String recaptchaToken;
}
