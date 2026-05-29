package com.escala.authservice.dto;

import lombok.Data;

@Data
public class CheckInRequest {
    private Double latitude;
    private Double longitude;
    private String deviceFingerprint;
}
