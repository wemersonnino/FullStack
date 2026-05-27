package com.escala.authservice.dto;

import lombok.Data;

@Data
public class UpdateCurrentUserRequest {
    private String username;
    private String email;
    private String theme;
}
