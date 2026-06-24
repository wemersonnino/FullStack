package com.escala.authservice.dto.rebac;

import com.escala.authservice.entity.ManagementEdge;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@Builder
public class ManagementEdgeResponse {
    private Long id;
    private Long parentUserId;
    private String parentName;
    private Long childUserId;
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
