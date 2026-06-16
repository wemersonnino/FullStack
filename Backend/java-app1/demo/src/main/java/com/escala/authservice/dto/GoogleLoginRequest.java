package com.escala.authservice.dto;

import lombok.Data;
import java.util.Map;

@Data
public class GoogleLoginRequest {
    private String idToken;
    private String companySlug;
    private String recaptchaToken;
    private Map<String, String> attribution;
}
