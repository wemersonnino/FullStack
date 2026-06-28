package com.escala.authservice.dto.rebac;

import com.escala.authservice.entity.ManagerRoleLevel;
import com.escala.authservice.entity.ManagerScopeType;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class ManagerAssignmentRequest {
    private UUID managerUserId;
    private ManagerScopeType scopeType;
    private UUID scopeId;
    private ManagerRoleLevel roleLevel;
    private OffsetDateTime startsAt;
    private OffsetDateTime endsAt;
    private Boolean active;
}
