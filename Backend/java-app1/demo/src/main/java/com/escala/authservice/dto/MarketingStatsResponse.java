package com.escala.authservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MarketingStatsResponse {
    private long totalLeads;
    private long activeTrials;
    private long convertedToPaid;
    private long aiRequestsThisMonth;
    private double conversionRate;
}
