package com.escala.authservice.dto.audit;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AuditLogPageResponse {
    private List<AuditLogResponse> items;
    private AuditSummaryResponse summary;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
}
