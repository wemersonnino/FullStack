package com.escala.authservice.service;

import com.escala.authservice.dto.scheduling.HolidayRequest;
import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.ScheduleHoliday;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.ScheduleHolidayRepository;
import com.escala.authservice.repository.UserRepository;
import com.escala.authservice.scheduling.domain.monthly.Holiday;
import com.escala.authservice.scheduling.domain.monthly.HolidayType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleHolidayService {
    private final ScheduleHolidayRepository scheduleHolidayRepository;
    private final UserRepository userRepository;

    public List<ScheduleHoliday> listHolidays(String email, int year, Long unitId) {
        User requester = getRequester(email);
        LocalDate startDate = LocalDate.of(year, 1, 1);
        LocalDate endDate = LocalDate.of(year, 12, 31);
        return scheduleHolidayRepository.findApplicable(requester.getCompany().getId(), startDate, endDate, unitId);
    }

    public List<Holiday> listDomainHolidaysForMonth(String email, int year, int month, Long unitId) {
        User requester = getRequester(email);
        YearMonth yearMonth = YearMonth.of(year, month);
        return scheduleHolidayRepository.findApplicable(
                        requester.getCompany().getId(),
                        yearMonth.atDay(1),
                        yearMonth.atEndOfMonth(),
                        unitId
                )
                .stream()
                .map(this::toDomain)
                .toList();
    }

    @Transactional
    public ScheduleHoliday createHoliday(String email, HolidayRequest request) {
        User requester = getRequester(email);
        validate(request);

        Company company = requester.getCompany();
        ScheduleHoliday holiday = ScheduleHoliday.builder()
                .company(company)
                .holidayDate(request.date())
                .name(request.name().trim())
                .type(request.type())
                .unitId(request.unitId())
                .build();

        return scheduleHolidayRepository.save(holiday);
    }

    private User getRequester(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario nao encontrado"));
    }

    private void validate(HolidayRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Feriado e obrigatorio");
        }
        if (request.date() == null) {
            throw new IllegalArgumentException("Data do feriado e obrigatoria");
        }
        if (request.name() == null || request.name().isBlank()) {
            throw new IllegalArgumentException("Nome do feriado e obrigatorio");
        }
        if (request.type() == null) {
            throw new IllegalArgumentException("Tipo do feriado e obrigatorio");
        }
    }

    private Holiday toDomain(ScheduleHoliday holiday) {
        HolidayType type = holiday.getType();
        return new Holiday(holiday.getHolidayDate(), holiday.getName(), type, holiday.getUnitId());
    }
}
