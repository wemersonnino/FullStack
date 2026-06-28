package com.escala.authservice.dto.rebac;

import com.escala.authservice.entity.ManagementEdge;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class ManagementEdgeResponse {
    private UUID id;
    private UUID parentUserId;
    private String parentName;
    private UUID childUserId;
    private String childName;
    private String relationType;
    private OffsetDateTime startsAt;
    private OffsetDateTime endsAt;
    private boolean active;

    public static ManagementEdgeResponse from(ManagementEdge edge) {
        return ManagementEdgeResponse.builder()
                .id(edge.getId())
                .parentUserId(edge.getParent().getId())
                .parentName(edge.getParent().getUsername())
                .childUserId(edge.getChild().getId())
                .childName(edge.getChild().getUsername())
                .relationType(edge.getRelationType())
                .startsAt(edge.getStartsAt())
                .endsAt(edge.getEndsAt())
                .active(edge.isActive())
                .build();
    }
}
