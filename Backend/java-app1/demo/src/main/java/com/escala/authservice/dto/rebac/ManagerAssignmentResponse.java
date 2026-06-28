package com.escala.authservice.dto.rebac;

import com.escala.authservice.entity.ManagerAssignment;
import com.escala.authservice.entity.ManagerRoleLevel;
import com.escala.authservice.entity.ManagerScopeType;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class ManagerAssignmentResponse {
    private UUID id;
    private UUID managerUserId;
    private String managerName;
    private String managerEmail;
    private ManagerScopeType scopeType;
    private UUID scopeId;
    private ManagerRoleLevel roleLevel;
    private int levelWeight;
    private OffsetDateTime startsAt;
    private OffsetDateTime endsAt;
    private boolean active;

    public static ManagerAssignmentResponse from(ManagerAssignment assignment) {
        return ManagerAssignmentResponse.builder()
                .id(assignment.getId())
                .managerUserId(assignment.getManager().getId())
                .managerName(assignment.getManager().getUsername())
                .managerEmail(assignment.getManager().getEmail())
                .scopeType(assignment.getScopeType())
                .scopeId(assignment.getScopeId())
                .roleLevel(assignment.getRoleLevel())
                .levelWeight(assignment.getLevelWeight())
                .startsAt(assignment.getStartsAt())
                .endsAt(assignment.getEndsAt())
                .active(assignment.isActive())
                .build();
    }
}
