package com.escala.authservice.dto.rebac;

import com.escala.authservice.entity.ManagerRoleLevel;
import com.escala.authservice.entity.ManagerScopeType;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class ManagerAssignmentRequest {
    private Long managerUserId;
    private ManagerScopeType scopeType;
    private Long scopeId;
    private ManagerRoleLevel roleLevel;
    private OffsetDateTime startsAt;
    private OffsetDateTime endsAt;
    private Boolean active;
}
