package com.escala.authservice.controller;

import com.escala.authservice.dto.scheduling.MonthCalendarDayResponse;
import com.escala.authservice.dto.scheduling.MonthCalendarResponse;
import com.escala.authservice.scheduling.domain.monthly.MonthlyCalendar;
import com.escala.authservice.scheduling.domain.monthly.MonthlyCalendarDay;
import com.escala.authservice.scheduling.domain.monthly.MonthlyCalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
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

    @GetMapping("/month-calendar")
    public MonthCalendarResponse monthCalendar(
            @RequestParam int year,
            @RequestParam int month,
            @RequestParam(required = false) Long unitId,
            @RequestParam(defaultValue = "America/Sao_Paulo") String timezone
    ) {
        try {
            MonthlyCalendar calendar = monthlyCalendarService.generate(year, month, ZoneId.of(timezone), unitId, List.of());
            return toResponse(calendar);
        } catch (DateTimeException exception) {
            throw new IllegalArgumentException("Ano, mes ou timezone invalidos para gerar calendario mensal", exception);
        }
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
}
