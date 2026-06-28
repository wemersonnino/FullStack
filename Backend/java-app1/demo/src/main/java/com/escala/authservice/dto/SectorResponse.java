package com.escala.authservice.dto;

import com.escala.authservice.entity.Sector;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SectorResponse {
    private String id;
    private String name;
    private String description;
    private Integer maxSeats;
    private String managerId;
    private String managerName;

    public static SectorResponse from(Sector sector) {
        if (sector == null) return null;
        return SectorResponse.builder()
                .id(sector.getId().toString())
                .name(sector.getName())
                .description(sector.getDescription())
                .maxSeats(sector.getMaxSeats())
                .managerId(sector.getManager() != null ? sector.getManager().getId().toString() : null)
                .managerName(sector.getManager() != null ? sector.getManager().getUsername() : null)
                .build();
    }
}
