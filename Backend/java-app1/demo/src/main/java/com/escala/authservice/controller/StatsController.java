package com.escala.authservice.controller;

import com.escala.authservice.dto.DashboardSummaryResponse;
import com.escala.authservice.dto.MarketingStatsResponse;
import com.escala.authservice.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/stats")
@RequiredArgsConstructor
public class StatsController {
    private final StatsService statsService;

    @GetMapping("/summary")
    public DashboardSummaryResponse getSummary(@RequestParam int year, @RequestParam int month, Authentication authentication) {
        return statsService.getSummary(year, month, authentication.getName());
    }

    @GetMapping("/marketing")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'OWNER', 'MARKETING')")
    public MarketingStatsResponse getMarketingStats() {
        return statsService.getMarketingStats();
    }
}
