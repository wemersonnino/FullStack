package com.escala.authservice.dto.rebac;

import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class ManagementEdgeRequest {
    private Long parentUserId;
    private Long childUserId;
    private String relationType;
    private OffsetDateTime startsAt;
    private OffsetDateTime endsAt;
    private Boolean active;
}
