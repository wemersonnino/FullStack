package com.escala.authservice.controller;

import com.escala.authservice.dto.scheduling.AcknowledgeValidationAlertRequest;
import com.escala.authservice.dto.scheduling.CycleAssignmentResponse;
import com.escala.authservice.dto.scheduling.CycleAssignmentsRequest;
import com.escala.authservice.dto.scheduling.CycleCounterResponse;
import com.escala.authservice.dto.scheduling.CycleValidationAlertResponse;
import com.escala.authservice.dto.scheduling.HolidayRequest;
import com.escala.authservice.dto.scheduling.HolidayResponse;
import com.escala.authservice.dto.scheduling.MonthCalendarDayResponse;
import com.escala.authservice.dto.scheduling.MonthCalendarResponse;
import com.escala.authservice.dto.scheduling.LegendResponse;
import com.escala.authservice.dto.scheduling.ScheduleCycleRequest;
import com.escala.authservice.dto.scheduling.ScheduleCycleResponse;
import com.escala.authservice.dto.scheduling.ValidationAcknowledgementResponse;
import com.escala.authservice.entity.ScheduleCycle;
import com.escala.authservice.entity.ScheduleCycleAssignment;
import com.escala.authservice.entity.ScheduleHoliday;
import com.escala.authservice.entity.ScheduleValidationAcknowledgement;
import com.escala.authservice.service.ScheduleCycleAssignmentService;
import com.escala.authservice.service.ScheduleCyclePublicationService;
import com.escala.authservice.service.ScheduleCycleService;
import com.escala.authservice.service.ScheduleCycleValidationService;
import com.escala.authservice.service.ScheduleHolidayService;
import com.escala.authservice.service.ScheduleValidationAcknowledgementService;
import com.escala.authservice.scheduling.domain.monthly.LegendCatalogService;
import com.escala.authservice.scheduling.domain.monthly.LegendCode;
import com.escala.authservice.scheduling.domain.monthly.Holiday;
import com.escala.authservice.scheduling.domain.monthly.MonthlyCalendar;
import com.escala.authservice.scheduling.domain.monthly.MonthlyCalendarDay;
import com.escala.authservice.scheduling.domain.monthly.MonthlyCalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.DateTimeException;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/scheduling")
@RequiredArgsConstructor
public class SchedulingController {
    private final MonthlyCalendarService monthlyCalendarService;
    private final LegendCatalogService legendCatalogService;
    private final ScheduleHolidayService scheduleHolidayService;
    private final ScheduleCycleService scheduleCycleService;
    private final ScheduleCycleAssignmentService scheduleCycleAssignmentService;
    private final ScheduleCycleValidationService scheduleCycleValidationService;
    private final ScheduleValidationAcknowledgementService scheduleValidationAcknowledgementService;
    private final ScheduleCyclePublicationService scheduleCyclePublicationService;

    @GetMapping("/month-calendar")
    public MonthCalendarResponse monthCalendar(
            @RequestParam int year,
            @RequestParam int month,
            @RequestParam(required = false) Long unitId,
            @RequestParam(defaultValue = "America/Sao_Paulo") String timezone,
            Authentication authentication
    ) {
        try {
            List<Holiday> holidays = scheduleHolidayService.listDomainHolidaysForMonth(
                    authentication.getName(),
                    year,
                    month,
                    unitId
            );
            MonthlyCalendar calendar = monthlyCalendarService.generate(year, month, ZoneId.of(timezone), unitId, holidays);
            return toResponse(calendar);
        } catch (DateTimeException exception) {
            throw new IllegalArgumentException("Ano, mes ou timezone invalidos para gerar calendario mensal", exception);
        }
    }

    @GetMapping("/holidays")
    public List<HolidayResponse> holidays(
            @RequestParam int year,
            @RequestParam(required = false) Long unitId,
            Authentication authentication
    ) {
        return scheduleHolidayService.listHolidays(authentication.getName(), year, unitId).stream()
                .map(this::toResponse)
                .toList();
    }

    @PostMapping("/holidays")
    public ResponseEntity<HolidayResponse> createHoliday(
            @RequestBody HolidayRequest request,
            Authentication authentication
    ) {
        ScheduleHoliday holiday = scheduleHolidayService.createHoliday(authentication.getName(), request);
        return ResponseEntity.ok(toResponse(holiday));
    }

    @GetMapping("/legends")
    public List<LegendResponse> legends() {
        return legendCatalogService.listDefaultLegends().stream()
                .map(this::toResponse)
                .toList();
    }

    @PostMapping("/cycles")
    public ResponseEntity<ScheduleCycleResponse> createCycle(
            @RequestBody ScheduleCycleRequest request,
            Authentication authentication
    ) {
        ScheduleCycle cycle = scheduleCycleService.createCycle(authentication.getName(), request);
        return ResponseEntity.ok(toResponse(cycle));
    }

    @GetMapping("/cycles/{id}")
    public ScheduleCycleResponse cycle(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        return toResponse(scheduleCycleService.getCycle(authentication.getName(), id));
    }

    @GetMapping("/cycles/{id}/assignments")
    public List<CycleAssignmentResponse> assignments(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        return scheduleCycleAssignmentService.listAssignments(authentication.getName(), id).stream()
                .map(this::toResponse)
                .toList();
    }

    @PatchMapping("/cycles/{id}/assignments")
    public List<CycleAssignmentResponse> replaceAssignments(
            @PathVariable UUID id,
            @RequestBody CycleAssignmentsRequest request,
            Authentication authentication
    ) {
        return scheduleCycleAssignmentService.replaceAssignments(authentication.getName(), id, request).stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/cycles/{id}/counters")
    public List<CycleCounterResponse> counters(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        return scheduleCycleAssignmentService.calculateCounters(authentication.getName(), id);
    }

    @PostMapping("/cycles/{id}/validate")
    public List<CycleValidationAlertResponse> validateCycle(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        return scheduleCycleValidationService.validateCycle(authentication.getName(), id);
    }

    @GetMapping("/cycles/{id}/alerts")
    public List<CycleValidationAlertResponse> alerts(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        return scheduleCycleValidationService.validateCycle(authentication.getName(), id);
    }

    @PostMapping("/cycles/{id}/alerts/{alertId}/acknowledge")
    public ValidationAcknowledgementResponse acknowledgeAlert(
            @PathVariable UUID id,
            @PathVariable String alertId,
            @RequestBody(required = false) AcknowledgeValidationAlertRequest request,
            Authentication authentication
    ) {
        return toResponse(scheduleValidationAcknowledgementService.acknowledge(
                authentication.getName(),
                id,
                alertId,
                request
        ));
    }

    @PostMapping("/cycles/{id}/publish")
    public ScheduleCycleResponse publishCycle(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        return toResponse(scheduleCyclePublicationService.publish(authentication.getName(), id));
    }

    @PostMapping("/cycles/{id}/archive")
    public ScheduleCycleResponse archiveCycle(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        return toResponse(scheduleCyclePublicationService.archive(authentication.getName(), id));
    }

    private MonthCalendarResponse toResponse(MonthlyCalendar calendar) {
        return new MonthCalendarResponse(
                calendar.year(),
                calendar.month(),
                calendar.timezone().getId(),
                calendar.unitId(),
                calendar.days().stream().map(this::toResponse).toList()
        );
    }

    private MonthCalendarDayResponse toResponse(MonthlyCalendarDay day) {
        return new MonthCalendarDayResponse(
                day.date(),
                day.weekend(),
                day.holidayApplied(),
                day.holidayApplied() ? day.holiday().name() : null,
                day.holidayApplied() ? day.holiday().type().name() : null
        );
    }

    private LegendResponse toResponse(LegendCode legend) {
        return new LegendResponse(
                legend.code(),
                legend.label(),
                legend.impact().name(),
                legend.plannedHours().toMinutes()
        );
    }

    private HolidayResponse toResponse(ScheduleHoliday holiday) {
        return new HolidayResponse(
                holiday.getPublicId().toString(),
                holiday.getHolidayDate(),
                holiday.getName(),
                holiday.getType().name(),
                holiday.getUnitId()
        );
    }

    private ScheduleCycleResponse toResponse(ScheduleCycle cycle) {
        return new ScheduleCycleResponse(
                cycle.getPublicId().toString(),
                cycle.getYear(),
                cycle.getMonth(),
                cycle.getUnitId(),
                cycle.getTimezone(),
                cycle.getStatus().name(),
                cycle.getBusinessVersion(),
                cycle.getPublishedAt(),
                cycle.getPublishedBy() == null ? null : cycle.getPublishedBy().getEmail(),
                cycle.getArchivedAt(),
                cycle.getArchivedBy() == null ? null : cycle.getArchivedBy().getEmail(),
                cycle.getCreatedAt(),
                cycle.getUpdatedAt()
        );
    }

    private CycleAssignmentResponse toResponse(ScheduleCycleAssignment assignment) {
        return new CycleAssignmentResponse(
                assignment.getPublicId().toString(),
                assignment.getEmployee().getPublicId().toString(),
                assignment.getEmployee().getFullName(),
                assignment.getAssignmentDate(),
                assignment.getLegendCode(),
                assignment.getLegendLabel(),
                assignment.getLegendImpact(),
                assignment.getPlannedMinutes(),
                assignment.getModality().name()
        );
    }

    private ValidationAcknowledgementResponse toResponse(ScheduleValidationAcknowledgement acknowledgement) {
        return new ValidationAcknowledgementResponse(
                acknowledgement.getPublicId().toString(),
                acknowledgement.getAlertId(),
                acknowledgement.getRuleCode(),
                acknowledgement.getSeverity(),
                acknowledgement.getAcknowledgedBy().getEmail(),
                acknowledgement.getReason(),
                acknowledgement.getAcknowledgedAt()
        );
    }
}
