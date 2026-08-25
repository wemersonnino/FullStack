package com.escala.authservice.controller;

import com.escala.authservice.dto.CreateShiftSwapRequest;
import com.escala.authservice.dto.DashboardSummaryResponse;
import com.escala.authservice.dto.DecideShiftSwapRequest;
import com.escala.authservice.dto.GenerateScheduleRequest;
import com.escala.authservice.entity.ShiftSwapRequest;
import com.escala.authservice.entity.WorkShift;
import com.escala.authservice.service.ScheduleService;
import com.escala.authservice.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/schedules")
@RequiredArgsConstructor
public class ScheduleController {
    private final ScheduleService scheduleService;
    private final StatsService statsService;

    @GetMapping
    public List<WorkShift> listMonth(@RequestParam int year, @RequestParam int month, Authentication authentication) {
        return scheduleService.listMonth(year, month, authentication.getName());
    }

    @PostMapping("/generate")
    public ResponseEntity<List<WorkShift>> generateMonth(@RequestBody GenerateScheduleRequest request, Authentication authentication) {
        return ResponseEntity.ok(scheduleService.generateMonth(request, authentication.getName()));
    }

    @GetMapping("/swap-requests")
    public List<ShiftSwapRequest> swapRequests(Authentication authentication) {
        return scheduleService.swapRequests(authentication.getName());
    }

    @PostMapping("/swap-requests")
    public ResponseEntity<ShiftSwapRequest> requestSwap(
            @RequestBody CreateShiftSwapRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(scheduleService.requestSwap(request, authentication.getName()));
    }

    @PatchMapping("/swap-requests/{id}/decision")
    public ResponseEntity<ShiftSwapRequest> decideSwap(@PathVariable UUID id, @RequestBody DecideShiftSwapRequest request, Authentication authentication) {
        return ResponseEntity.ok(scheduleService.decideSwap(id, request, authentication.getName()));
    }

    @PatchMapping("/swap-requests/{id}/colleague-approval")
    public ResponseEntity<ShiftSwapRequest> approveByColleague(@PathVariable UUID id, Authentication authentication) {
        return ResponseEntity.ok(scheduleService.approveByColleague(id, authentication.getName()));
    }

    @GetMapping("/dashboard-summary")
    public DashboardSummaryResponse dashboardSummary(@RequestParam int year, @RequestParam int month, Authentication authentication) {
        return statsService.getSummary(year, month, authentication.getName());
    }
}
