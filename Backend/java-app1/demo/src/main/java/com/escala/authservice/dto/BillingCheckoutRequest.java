package com.escala.authservice.dto;

import lombok.Data;

@Data
public class BillingCheckoutRequest {
    private String planType;
    private String successUrl;
    private String cancelUrl;
}
