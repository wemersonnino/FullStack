package com.escala.authservice.dto;

import lombok.Data;

@Data
public class ResetPasswordRequest {
    private String code;
    private String password;
    private String passwordConfirmation;
    private String recaptchaToken;
}
