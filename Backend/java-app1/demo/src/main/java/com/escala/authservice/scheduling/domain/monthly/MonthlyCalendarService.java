package com.escala.authservice.scheduling.domain.monthly;

import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
public class MonthlyCalendarService {

    public MonthlyCalendar generate(int year, int month, ZoneId timezone, Long unitId, List<Holiday> holidays) {
        YearMonth yearMonth = YearMonth.of(year, month);
        Map<LocalDate, Holiday> holidaysByDate = holidaysForUnit(holidays, unitId);

        List<MonthlyCalendarDay> days = IntStream.rangeClosed(1, yearMonth.lengthOfMonth())
                .mapToObj(day -> {
                    LocalDate date = yearMonth.atDay(day);
                    return new MonthlyCalendarDay(date, isWeekend(date), holidaysByDate.get(date));
                })
                .toList();

        return new MonthlyCalendar(year, month, timezone, unitId, days);
    }

    private Map<LocalDate, Holiday> holidaysForUnit(List<Holiday> holidays, Long unitId) {
        List<Holiday> safeHolidays = holidays == null ? List.of() : holidays;
        return safeHolidays.stream()
                .filter(holiday -> holiday.appliesTo(unitId))
                .sorted(Comparator.comparing(holiday -> holiday.unitId() == null))
                .collect(Collectors.toMap(Holiday::date, Function.identity(), (first, second) -> first));
    }

    private boolean isWeekend(LocalDate date) {
        return date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY;
    }
}
