package com.escala.authservice.dto.rebac;

import com.escala.authservice.entity.ManagementClosure;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ManagementClosureResponse {
    private Long id;
    private Long ancestorUserId;
    private String ancestorName;
    private Long descendantUserId;
    private String descendantName;
    private int depth;
    private int maxWeightPath;

    public static ManagementClosureResponse from(ManagementClosure closure) {
        return ManagementClosureResponse.builder()
                .id(closure.getId())
                .ancestorUserId(closure.getAncestor().getId())
                .ancestorName(closure.getAncestor().getUsername())
                .descendantUserId(closure.getDescendant().getId())
                .descendantName(closure.getDescendant().getUsername())
                .depth(closure.getDepth())
                .maxWeightPath(closure.getMaxWeightPath())
                .build();
    }
}
