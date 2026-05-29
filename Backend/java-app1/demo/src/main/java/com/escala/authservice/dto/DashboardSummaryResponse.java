package com.escala.authservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardSummaryResponse {
    private long activeEmployees;
    private long activeProjects;
    private long shiftsInMonth;
    private long pendingSwapRequests;
    private long absencesInMonth;
}
