package com.escala.authservice.dto;

import java.util.UUID;

import lombok.Data;

@Data
public class SectorRequest {
    private String name;
    private String description;
    private Integer maxSeats;
    private UUID managerId;
}
