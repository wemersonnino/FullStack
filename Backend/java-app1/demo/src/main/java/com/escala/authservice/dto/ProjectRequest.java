package com.escala.authservice.dto;

import lombok.Data;

@Data
public class ProjectRequest {
    private String name;
    private String description;
    private Boolean active;
}
