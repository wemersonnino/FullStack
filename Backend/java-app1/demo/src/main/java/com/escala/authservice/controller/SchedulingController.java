package com.escala.authservice.controller;

import com.escala.authservice.dto.scheduling.HolidayRequest;
import com.escala.authservice.dto.scheduling.HolidayResponse;
import com.escala.authservice.dto.scheduling.MonthCalendarDayResponse;
import com.escala.authservice.dto.scheduling.MonthCalendarResponse;
import com.escala.authservice.dto.scheduling.LegendResponse;
import com.escala.authservice.entity.ScheduleHoliday;
import com.escala.authservice.service.ScheduleHolidayService;
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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.DateTimeException;
import java.time.ZoneId;
import java.util.List;

@RestController
@RequestMapping("/api/v1/scheduling")
@RequiredArgsConstructor
public class SchedulingController {
    private final MonthlyCalendarService monthlyCalendarService;
    private final LegendCatalogService legendCatalogService;
    private final ScheduleHolidayService scheduleHolidayService;

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
                holiday.getId(),
                holiday.getHolidayDate(),
                holiday.getName(),
                holiday.getType().name(),
                holiday.getUnitId()
        );
    }
}
