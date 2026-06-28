package com.escala.authservice.dto.rebac;

import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class ManagementEdgeRequest {
    private UUID parentUserId;
    private UUID childUserId;
    private String relationType;
    private OffsetDateTime startsAt;
    private OffsetDateTime endsAt;
    private Boolean active;
}
